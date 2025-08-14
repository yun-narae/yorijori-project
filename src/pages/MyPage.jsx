import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import CustomButton from "../components/CustomButton/CustomButton";
import ProfileAvatar from "../components/Profile/ProfileAvatar";

const MyPage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    return (
        <div className="
            flex flex-col 
            max-w-[500px] mx-auto mt-8 mb-8
            px-4
            tablet:px-0
            desktop:px-0
        ">
            <div className="mb-4 flex flex-col gap-2 items-center">
                <ProfileAvatar
                    user={user}
                    currentUserId={user?.id}
                    size="lg"
                    linkBehavior="self"
                    click={false}
                    />
                <b>{user?.nickname}</b>
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
