// src/lib/pocketbase.js
import PocketBase from "pocketbase";

const isDev = import.meta.env.DEV;
const proxyOn = import.meta.env.VITE_PB_PROXY === "1";

// 개발(프록시) ⇒ http://localhost:5173  (SDK가 내부적으로 /api 붙임)
// 배포(직접 호출) ⇒ VITE_PB_URL(예: https://y-narae.pockethost.io)
const baseUrl = (isDev && proxyOn)
    ? window.location.origin
    : (import.meta.env.VITE_PB_URL || window.location.origin);

const pb = new PocketBase(baseUrl);
pb.autoCancellation(false);

// 디버그
if (isDev) console.log("[PB baseUrl]", baseUrl);

export default pb;
