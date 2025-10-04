// src/lib/pocketbase.js
import PocketBase from "pocketbase";

/**
 * PB 접속 설정
 * - 기본: VITE_PB_URL 사용
 * - 프록시 사용 시: VITE_PB_PROXY=1 → baseUrl="/api"
 * - 둘 다 없으면 로컬 기본값으로 127.0.0.1:8090
 */
const isBrowser = typeof window !== "undefined";
const viaProxy = import.meta.env.VITE_PB_PROXY === "1";
const envUrl = (import.meta.env.VITE_PB_URL || "").trim();
const DEFAULT_DEV_URL = "http://127.0.0.1:8090";

const baseUrl = viaProxy ? "/api" : (envUrl || DEFAULT_DEV_URL);

const pb = new PocketBase(baseUrl);

// 안전장치들
if (isBrowser) {
    // fetch 취소로 인한 사이드이펙트 방지
    pb.autoCancellation(false);
    // 필요 시: 토큰 자동 리프레시 등 부가 훅을 여기서 붙일 수 있음
    // pb.authStore.onChange((token) => {...}, true);
}

export default pb;
