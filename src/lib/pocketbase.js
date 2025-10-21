import PocketBase from "pocketbase";

const PB_URL = (import.meta.env.VITE_PB_URL || "http://127.0.0.1:8090").trim();
const pb = new PocketBase(PB_URL);

// HTTP/2, HTTP/3 프로토콜 에러 방지를 위한 설정
pb.autoCancellation(false); // 자동 취소 비활성화 (필요시)

// QUIC/HTTP3 비활성화 및 요청 제한을 위한 설정
if (typeof window !== 'undefined') {
  // 브라우저 환경에서만 실행
  const originalFetch = window.fetch;
  const requestQueue = new Map(); // 요청 큐 관리
  const requestCounts = new Map(); // 요청 횟수 추적
  
  window.fetch = function(url, options = {}) {
    // HTTP/3 비활성화 헤더 추가
    if (!options.headers) options.headers = {};
    options.headers['Alt-Svc'] = '';
    options.headers['Connection'] = 'keep-alive';
    
    // 동일한 URL에 대한 요청 제한 (429 에러 방지)
    const urlKey = url.toString();
    const now = Date.now();
    const lastRequest = requestQueue.get(urlKey);
    const requestCount = requestCounts.get(urlKey) || 0;
    
    // 5초 내에 3번 이상 요청하면 차단
    if (requestCount > 2 && lastRequest && (now - lastRequest) < 5000) {
      console.warn(`요청 제한: ${urlKey} - 너무 빈번한 요청`);
      return Promise.reject(new Error('Too many requests'));
    }
    
    // 1초 내에 동일한 요청이 있으면 지연
    if (lastRequest && (now - lastRequest) < 1000) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          requestQueue.set(urlKey, Date.now());
          requestCounts.set(urlKey, (requestCounts.get(urlKey) || 0) + 1);
          
          // 5초 후 카운트 리셋
          setTimeout(() => {
            requestCounts.delete(urlKey);
          }, 5000);
          
          originalFetch(url, options)
            .then(resolve)
            .catch(reject);
        }, 200); // 지연 시간 증가
      });
    }
    
    requestQueue.set(urlKey, now);
    requestCounts.set(urlKey, (requestCounts.get(urlKey) || 0) + 1);
    
    // 5초 후 카운트 리셋
    setTimeout(() => {
      requestCounts.delete(urlKey);
    }, 5000);
    
    return originalFetch(url, options);
  };
}

// 디버깅 시 공백 여부 확인용
console.log("[pb baseUrl]", JSON.stringify(PB_URL));

export default pb;
