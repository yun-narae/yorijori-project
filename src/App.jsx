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

// 각 페이지 스켈레톤
import PostCreateSkeleton from "./components/Skeletons/PostCreateSkeleton";

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
                            path="/myPage"
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
                                // 이미 존재하는 PostCreateSkeleton 활용
                                <Suspense fallback={<PostCreateSkeleton step={0} />}>
                                    <PostCreate />
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
