import { useQuery } from "@tanstack/react-query";
import pb from "../lib/pocketbase";

const COL = "post_participation";

export default function useParticipantsUsers(postId) {
    return useQuery({
        queryKey: ["participants-users", postId],
        enabled: !!postId, // postId 없으면 호출 안 함
        queryFn: async () => {
            try {
                const res = await pb.collection(COL).getList(1, 200, {
                    filter: `post = "${postId}"`,
                    expand: "user",
                    fields: "id,expand.user",
                });
                return (res?.items || [])
                    .map((r) => r?.expand?.user)
                    .filter(Boolean);
            } catch (e) {
                // RLS(401/403), 잘못된 컬렉션/훅 500 등은 일단 빈 배열 반환하여 화면이 죽지 않게
                const code = e?.status || e?.data?.code;
                if (code === 401 || code === 403 || code === 404 || code === 500) {
                    return [];
                }
                throw e;
            }
        },
        retry: false,
        staleTime: 10000,
    });
}
