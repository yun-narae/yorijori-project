import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import getPbImageURL from '../lib/getPbImageURL';
import CustomButton from '../components/CustomButton/CustomButton';

const MyPage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

     // ✅ 이미지 URL 생성
    const imageUrl = user?.images
    ? getPbImageURL(user, 'images')
    : "https://placehold.co/150x150?text=No+Image";

    return (
        <div className="
            flex flex-col 
            max-w-[500px] mx-auto mt-8 mb-8
            px-4
            tablet:px-0
            desktop:px-0
        ">
            <div className="mb-4 flex flex-col items-center">
                <p>불러온 사용자 이메일: {user?.email}</p>
                <img
                src={imageUrl}
                alt="불러온 사용자 프로필"
                className="w-32 h-32 rounded-full object-cover"
                />
            </div>

            <CustomButton
                text="로그아웃"
                variant="secondary"
                size="md"
                onClick={() => {
                    logout();
                    navigate("/");
                }}
            />
        </div>
    );
};

export default MyPage;
