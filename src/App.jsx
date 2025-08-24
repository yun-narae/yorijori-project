import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { Suspense, lazy, useEffect, useLayoutEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./Layout";

const Home = lazy(() => import("./pages/Home"));
const MyPage = lazy(() => import("./pages/MyPage"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const RegisterSuccess = lazy(() => import("./pages/RegisterSuccess"));
const FindPassword = lazy(() => import("./pages/FindPassword"));
const PostCreate = lazy(() => import("./pages/PostCreate"));
const MyPosts = lazy(() => import("./pages/MyPosts"));
const PostDetail = lazy(() => import("./pages/PostDetail"));
const PostEdit = lazy(() => import("./pages/PostEdit"));

// 각 페이지 스켈레톤
import PostCreateSkeleton from "./components/Skeletons/PostCreateSkeleton";
import PostCardSkeleton from "./components/Skeletons/PostCardSkeleton";
import PostDetailSkeleton from './components/Skeletons/PostDetailSkeleton';

function App() {
    // ① 첫 페인트 직전 보정(부트 스크립트가 있지만, SPA 내 이동 중 보정)
    useLayoutEffect(() => {
        const saved = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const isDark = saved ? (saved === "dark") : prefersDark;
        document.documentElement.classList.toggle("dark", isDark);
        document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    }, []);

    // ② storage / 커스텀 이벤트로 전역 동기화
    useEffect(() => {
        const apply = () => {
        const saved = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const isDark = saved ? (saved === "dark") : prefersDark;
        document.documentElement.classList.toggle("dark", isDark);
        document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
        };

        const onStorage = (e) => {
        if (e.key === "theme") apply();
        };
        window.addEventListener("storage", onStorage);
        window.addEventListener("themechange", apply); // 토글에서 보낼 커스텀 이벤트

        return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener("themechange", apply);
        };
    }, []);
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route element={<Layout />}>
                        <Route
                            path="/"
                            element={
                                <Suspense fallback={null}>
                                    <Home />
                                </Suspense>
                            }
                        />
                        <Route
                            path="/mypage/:userId"
                            element={
                                <Suspense fallback={null}>
                                    <MyPage />
                                </Suspense>
                            }
                        />
                        <Route
                            path="/login"
                            element={
                                <Suspense fallback={null}>
                                    <Login />
                                </Suspense>
                            }
                        />
                        <Route
                            path="/register"
                            element={
                                <Suspense fallback={null}>
                                    <Register />
                                </Suspense>
                            }
                        />
                        <Route
                            path="/register/success"
                            element={
                                <Suspense fallback={null}>
                                    <RegisterSuccess />
                                </Suspense>
                            }
                        />
                        <Route
                            path="/login/find-password"
                            element={
                                <Suspense fallback={null}>
                                    <FindPassword />
                                </Suspense>
                            }
                        />
                        <Route
                            path="/post/create"
                            element={
                                <Suspense fallback={<PostCreateSkeleton step={0} />}>
                                    <PostCreate />
                                </Suspense>
                            }
                        />
                        <Route
                            path="/post/mypost/:userId"
                            element={
                                <Suspense fallback={<PostCardSkeleton step={0} />}>
                                    <MyPosts />
                                </Suspense>
                            }
                        />
                        <Route
                            path="/post/detail/:postId"
                            element={
                                <Suspense fallback={<PostDetailSkeleton />}>
                                    <PostDetail />
                                </Suspense>
                            }
                        />
                        <Route path="/post/edit/:postId" element={<PostEdit />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
