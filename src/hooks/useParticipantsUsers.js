import { useQuery } from "@tanstack/react-query";
import pb from "../lib/pocketbase";

const COL = "post_participation";

export default function useParticipantsUsers(postId) {
    return useQuery({
        queryKey: ["participants-users", postId],
        enabled: !!postId,
        queryFn: async () => {
            try {
                const res = await pb.collection(COL).getList(1, 200, {
                    filter: `post = "${postId}"`,
                    expand: "user",
                    fields: "id,expand.user",
                });
                return (res?.items || []).map((r) => r?.expand?.user).filter(Boolean);
            } catch (e) {
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
