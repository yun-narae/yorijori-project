import { useEffect, useState } from "react";
import pb from "../lib/pocketbase";

// files 컬렉션이 있을 때만 호출하도록 토글(없으면 기본 false)
const HAS_FILES = import.meta.env.VITE_HAS_FILES === "1";

export default function useFetchFiles(collection = "files", page = 1, perPage = 50) {
    const [files, setFiles] = useState([]);
    const [dataLoading, setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;

        // ✅ files 컬렉션이 없으면 요청 자체를 보내지 않음(404/경고 모두 사라짐)
        if (!collection || (collection === "files" && !HAS_FILES)) {
            if (!cancelled) {
                setFiles([]);
                setLoading(false);
            }
            return () => {
                cancelled = true;
            };
        }

        (async () => {
            setLoading(true);
            try {
                const res = await pb.collection(collection).getList(page, perPage, {
                    sort: "-created",
                });
                if (!cancelled) setFiles(res?.items ?? []);
            } catch (err) {
                // 404는 조용히 빈 배열로 처리
                if (err?.status === 404) {
                    if (!cancelled) setFiles([]);
                }
                // 자동취소/Abort는 무시
                else if (err?.status === 0 || err?.name === "AbortError" || err?.isAbort) {
                    // no-op
                } else {
                    console.error(`[useFetchFiles] load failed for '${collection}':`, err);
                    if (!cancelled) setFiles([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [collection, page, perPage]);

    return { files, dataLoading };
}
