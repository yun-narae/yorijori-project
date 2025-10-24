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
        retry: 1, // 재시도 횟수 제한
        retryDelay: 2000, // 재시도 간격 2초
        staleTime: 30000, // 10초에서 30초로 증가
        refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 재요청 비활성화
        refetchOnMount: false, // 마운트 시 자동 재요청 비활성화
    });
}
