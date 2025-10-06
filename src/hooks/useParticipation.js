import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import pb from "../lib/pocketbase";

const COL = "post_participation";

export default function useParticipation(postId, currentUser) {
    const qc = useQueryClient();
    const userId = currentUser?.id ?? null;

    const { data, isLoading } = useQuery({
        queryKey: ["participation", postId, userId],
        enabled: !!postId,
        queryFn: async () => {
            // 용량(capacity)
            const post = await pb.collection("post").getOne(postId, { fields: "id,capacity" });
            const capacity = Number(post?.capacity || 0);

            // 참여 인원 수(totalItems) — 권한 문제(401/403/404/500)면 0으로 폴백
            let count = 0;
            try {
                const list = await pb.collection(COL).getList(1, 1, {
                    filter: `post = "${postId}"`,
                });
                count = Number(list?.totalItems ?? 0);
            } catch (e) {
                const code = e?.status || e?.data?.code;
                if (!(code === 401 || code === 403 || code === 404 || code === 500)) {
                    throw e;
                }
            }

            // 내가 참여했는지
            let mine = null;
            if (userId) {
                try {
                    const mineList = await pb.collection(COL).getList(1, 1, {
                        filter: `post = "${postId}" && user = "${userId}"`,
                    });
                    mine = mineList?.items?.[0] ?? null;
                } catch {
                    // 권한 문제면 무시
                }
            }

            const closed = capacity > 0 && count >= capacity;
            return { capacity, count, mine, closed };
        },
        staleTime: 10000,
    });

    const joinMutation = useMutation({
        mutationFn: async () => {
            if (!userId) throw new Error("NEED_LOGIN");
            return pb.collection(COL).create({ post: postId, user: userId });
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["participation", postId] });
        },
    });

    const cancelMutation = useMutation({
        mutationFn: async (joinId) => {
            return pb.collection(COL).delete(joinId);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["participation", postId] });
        },
    });

    const state = useMemo(
        () => ({
            count: data?.count ?? 0,
            capacity: data?.capacity ?? 0,
            isJoined: !!data?.mine,
            myJoinId: data?.mine?.id ?? null,
            isClosed: !!data?.closed,
            loading: isLoading,
        }),
        [data, isLoading]
    );

    return {
        ...state,
        join: () => joinMutation.mutateAsync(),
        cancel: () => state.myJoinId && cancelMutation.mutateAsync(state.myJoinId),
        joining: joinMutation.isPending,
        canceling: cancelMutation.isPending,
    };
}
