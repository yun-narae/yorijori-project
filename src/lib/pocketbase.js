import PocketBase from "pocketbase";

const PB_URL = (import.meta.env.VITE_PB_URL || "http://127.0.0.1:8090").trim();
const pb = new PocketBase(PB_URL);

// 디버깅 시 공백 여부 확인용
console.log("[pb baseUrl]", JSON.stringify(PB_URL));

export default pb;
