// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { Suspense, lazy, useEffect, useLayoutEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./Layout";
import pb from "./lib/pocketbase";
import { pruneAllLikesByPost } from "./hooks/useLikesStorage";
import { ensureRealtime } from "./lib/realtime";

// (기존 라우트들 그대로)
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
const MyInfoEdit = lazy(() => import("./pages/MyInfoEdit"));
const PostLikes = lazy(() => import("./pages/PostLikes"));
const ParticipationPostPage = lazy(() => import("./pages/ParticipationPostPage"));
const RecentPostsPage = lazy(() => import("./pages/RecentPostsPage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));

// 각 페이지 스켈레톤
import PostCreateSkeleton from "./components/Skeletons/PostCreateSkeleton";
import PostCardSkeleton from "./components/Skeletons/PostCardSkeleton";
import PostDetailSkeleton from './components/Skeletons/PostDetailSkeleton';

function App() {
    useEffect(() => {
        ensureRealtime();
        return () => { pb.realtime.disconnect(); };
      }, []);

    // (기존 테마/레이아웃 로직들 유지)
    useLayoutEffect(() => {
        const saved = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const isDark = saved ? (saved === "dark") : prefersDark;
        document.documentElement.classList.toggle("dark", isDark);
        document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    }, []);

    // ✅ 서버의 post 삭제 이벤트를 전역 구독 → 로컬의 모든 likes_* 키에서 해당 postId 제거
    useEffect(() => {
        let unsub;
        (async () => {
            try {
                // 중복 구독 방지 위해 기존 구독 해제 시도
                try { pb.collection("post").unsubscribe("*"); } catch {}
                unsub = await pb.collection("post").subscribe("*", (e) => {
                    if (e?.action === "delete" && e?.record?.id) {
                        pruneAllLikesByPost(e.record.id);
                    }
                });
            } catch {}
        })();
        return () => {
            try { pb.collection("post").unsubscribe("*"); } catch {}
            if (typeof unsub === "function") unsub();
        };
    }, []);

    useEffect(() => {
        let unsub;
        (async () => {
          try {
            // 전역으로 post 컬렉션 삭제 이벤트 수신 → 이 브라우저의 모든 likes_*에서 해당 postId 제거
            unsub = await pb.collection("post").subscribe("*", (e) => {
              if (e?.action === "delete" && e?.record?.id) {
                pruneAllLikesByPost(e.record.id);
              }
            });
          } catch (err) {
            console.warn("[post subscribe] failed:", err);
          }
        })();
      
        return () => {
          try { pb.collection("post").unsubscribe("*"); } catch {}
          if (typeof unsub === "function") unsub();
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
                            path="/posts/recent" 
                            element={
                                <Suspense fallback={<PostCardSkeleton variant="simple" />}>
                                    <RecentPostsPage />
                                </Suspense>
                            } 
                        />
                        <Route
                            path="/mypage"
                            element={
                                <Suspense fallback={null}>
                                    <MyPage />
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
                            path="/mypage/edit" 
                            element={<MyInfoEdit />} 
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
                                <Suspense fallback={<PostCardSkeleton />}>
                                    <MyPosts />
                                </Suspense>
                            }
                        />
                        <Route
                            path="/post/likes/:userId"
                            element={
                                <Suspense fallback={<PostCardSkeleton variant="simple" />}>
                                    <PostLikes />
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
                        <Route 
                            path="/post/edit/:postId" 
                            element={<PostEdit />}
                        />
                        <Route 
                            path="/post/participation/:userId" 
                            element={
                                <Suspense fallback={<PostCardSkeleton />}>
                                    <ParticipationPostPage />
                                </Suspense>
                            }
                        />
                        <Route 
                            path="/category" 
                            element={
                                <Suspense>
                                    <CategoryPage />
                                </Suspense>
                            }
                        />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
