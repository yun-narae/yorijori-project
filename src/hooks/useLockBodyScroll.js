import { useEffect } from "react";

export default function useLockBodyScroll(isLocked) {
    useEffect(() => {
        if (isLocked) {
            // 스크롤바 너비 계산 (스크롤이 있을 때만)
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            
            // 스크롤 잠금 전 현재 스크롤 위치 저장
            const scrollY = window.scrollY;
            
            // 스크롤 잠금
            document.body.style.overflow = "hidden";
            
            // 스크롤바 너비만큼 padding 추가 (레이아웃 시프트 방지)
            if (scrollbarWidth > 0) {
                document.body.style.paddingRight = `${scrollbarWidth}px`;
            }
            
            // 스크롤 위치 복원 (iOS Safari에서 필요할 수 있음)
            document.body.style.top = `-${scrollY}px`;
            document.body.style.position = "fixed";
            document.body.style.width = "100%";
        } else {
            // 스크롤 위치 복원
            const scrollY = document.body.style.top;
            
            // 스타일 초기화
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.width = "";
            
            // 스크롤 위치로 되돌리기
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
            }
        }
        
        return () => {
            // cleanup
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.width = "";
        };
    }, [isLocked]);
}
