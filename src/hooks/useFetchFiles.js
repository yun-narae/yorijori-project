import { useState, useEffect } from "react";
import pb from "../lib/pocketbase";

// 🔧 환경변수에서 스켈레톤 시간 읽기 (기본값 1000ms)
const LOADING_SKELETON_MS = Number(import.meta.env.VITE_LOADING_SKELETON_MS || 1000);

/**
 * 파일 리스트를 불러오고 로딩 상태를 관리하는 커스텀 훅
 * @param {string} collectionName - PocketBase 컬렉션 이름
 * @param {number} page - 페이지 번호
 * @param {number} perPage - 페이지 당 항목 수
 * @returns {{ dataLoading: boolean, fileData: any[], refetch: Function }}
 */
export default function useFetchFiles(collectionName = "files", page = 1, perPage = 50) {
    const [dataLoading, setDataLoading] = useState(true);
    const [fileData, setFileData] = useState([]);

    const fetchFiles = async (mountedRef) => {
        try {
            const res = await pb.collection(collectionName).getList(page, perPage);
            if (!mountedRef.current) return;
            setFileData(Array.isArray(res?.items) ? res.items : []);
        } catch (e) {
            if (!mountedRef.current) return;
            setFileData([]);
            console.error("파일 목록 로드 실패:", e);
        } finally {
            if (mountedRef.current) {
                setTimeout(() => {
                    if (mountedRef.current) setDataLoading(false);
                }, LOADING_SKELETON_MS);
            }
        }
    };

    useEffect(() => {
        const mountedRef = { current: true };
        fetchFiles(mountedRef);
        return () => { mountedRef.current = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collectionName, page, perPage]);

    return { dataLoading, fileData, refetch: () => fetchFiles({ current: true }) };
}
