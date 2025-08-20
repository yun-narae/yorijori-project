import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
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

// 각 페이지 스켈레톤
import PostCreateSkeleton from "./components/Skeletons/PostCreateSkeleton";
import PostCardSkeleton from "./components/Skeletons/PostCardSkeleton";
import PostDetailSkeleton from './components/Skeletons/PostDetailSkeleton';

function App() {
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
                                <Suspense fallback={<PostDetailSkeleton step={0} />}>
                                    <PostDetail />
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
