import React, { createContext, useContext, useEffect, useState } from "react";
import pb from "../lib/pocketbase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => pb.authStore.model || null);
    const [isLoggedIn, setIsLoggedIn] = useState(() => pb.authStore.isValid);

    useEffect(() => {
        const unsubscribe = pb.authStore.onChange(() => {
            setUser(pb.authStore.model || null);
            setIsLoggedIn(pb.authStore.isValid);
        });
        return () => unsubscribe();
    }, []);

    const login = async (email, password) => {
        const authData = await pb.collection("users").authWithPassword(email, password);
    
        setUser(authData.record);
        setIsLoggedIn(true);
    
        // ✅ localStorage 저장 (배포 환경에서도 동일)
        localStorage.setItem("userId", authData.record.id);
    
        // ✅ 호출한 쪽에서 바로 사용할 수 있도록 반환
        return authData.record;
    };

    const logout = () => {
        pb.authStore.clear();
        setUser(null);
        setIsLoggedIn(false);
    
        // ✅ 유저 ID 삭제
        localStorage.removeItem("userId");
    };

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
