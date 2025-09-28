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
            const post = await pb.collection("post").getOne(postId);
            const capacity = Number(post?.capacity || 0);

            const list = await pb.collection(COL).getList(1, 1, {
                filter: `post = "${postId}"`,
            });
            const count = Number(list?.totalItems ?? 0);

            let mine = null;
            if (userId) {
                const mineList = await pb.collection(COL).getList(1, 1, {
                    filter: `post = "${postId}" && user = "${userId}"`,
                });
                mine = mineList?.items?.[0] ?? null;
            }

            const closed = capacity > 0 && count >= capacity;
            return { capacity, count, mine, closed };
        },
        staleTime: 10000,
    });

    const joinMutation = useMutation({
        mutationFn: async () => {
            if (!userId) {
                const err = new Error("NEED_LOGIN");
                throw err;
            }
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

    const state = useMemo(() => ({
        count: data?.count ?? 0,
        capacity: data?.capacity ?? 0,
        isJoined: !!data?.mine,
        myJoinId: data?.mine?.id ?? null,
        isClosed: !!data?.closed,
        loading: isLoading,
    }), [data, isLoading]);

    return {
        ...state,
        join: () => joinMutation.mutateAsync(),
        cancel: () => state.myJoinId && cancelMutation.mutateAsync(state.myJoinId),
        joining: joinMutation.isPending,
        canceling: cancelMutation.isPending,
    };
}
