import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from "./contexts/AuthContext";
import Layout from './Layout';
import Home from './pages/Home';
import MyPage from './pages/MyPage';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterSuccess from './pages/RegisterSuccess';
import FindPassword from "./pages/FindPassword";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/myPage" element={<MyPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/register/success" element={<RegisterSuccess />} />
                    <Route path="/login/find-password" element={<FindPassword />} />
                </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
