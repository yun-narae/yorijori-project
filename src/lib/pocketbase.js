import PocketBase from "pocketbase";

const PB_URL = (import.meta.env.VITE_PB_URL || "http://127.0.0.1:8090").trim();
const pb = new PocketBase(PB_URL);

// HTTP/2 프로토콜 에러 방지를 위한 설정
pb.autoCancellation(false); // 자동 취소 비활성화 (필요시)

// 디버깅 시 공백 여부 확인용
console.log("[pb baseUrl]", JSON.stringify(PB_URL));

export default pb;
