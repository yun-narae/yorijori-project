import { useLocation } from "react-router-dom";
import { useNavItems } from "../lib/NavItems";

/**
 * 네비게이션 데이터를 관리하는 커스텀 훅
 */
export default function useNavigationData() {
    const location = useLocation();
    const NAV_ITEMS = useNavItems();
    
    // 네비게이션에 표시할 아이템들 필터링
    const navItems = NAV_ITEMS.filter((item) => item.showInNav);
    
    return {
        navItems,
        currentPath: location.pathname,
    };
}

