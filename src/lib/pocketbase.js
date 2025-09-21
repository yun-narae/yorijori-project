import PocketBase from "pocketbase";

// 개발(로컬)에서는 프록시 경유, 운영에서는 실제 호스트 사용
const baseUrl = import.meta.env.DEV
    ? "/pb"
    : "https://y-narae.pockethost.io";

const pb = new PocketBase(baseUrl);

// (선택) 쿠키 사용 시
// pb.authStore.loadFromCookie(document.cookie);

export default pb;
