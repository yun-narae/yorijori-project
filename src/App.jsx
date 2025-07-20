import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Home from './pages/Home';
import MyPage from './pages/MyPage';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
    return (
        <BrowserRouter>
        <Routes>
            <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/myPage" element={<MyPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            </Route>
        </Routes>
        </BrowserRouter>
    );
}

export default App;
