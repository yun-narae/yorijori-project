import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Home from './pages/Home';
import Test from './pages/Test';
import SignupPage from './pages/SignupPage';

function App() {
    return (
        <BrowserRouter>
        <Routes>
            <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/test" element={<Test />} />
            <Route path="/signup" element={<SignupPage />} />
            </Route>
        </Routes>
        </BrowserRouter>
    );
}

export default App;
