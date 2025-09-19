// src/pages/PostLikes.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PostCardCompact from "../components/PostCard/PostCardCompact"; 
import PageTitleBar from "../components/PageTitleBar/PageTitleBar";

export default function PostLikes() {
    const { userId } = useParams();
    const [likedPosts, setLikedPosts] = useState([]);

    useEffect(() => {
        // localStorage에서 유저별 좋아요 게시물 불러오기
        const storedLikes = localStorage.getItem(`likes_${userId}`);
        if (storedLikes) {
            setLikedPosts(JSON.parse(storedLikes));
        } else {
            setLikedPosts([]);
        }
    }, [userId]);

    return (
        <>
            <PageTitleBar />
    
            {likedPosts.length === 0 ? (
                <div
                    className="
                        h-screen
                        flex flex-col
                        max-w-[500px] mx-auto
                        items-center justify-center
                        px-4 tablet:px-0 desktop:px-0
                    "
                >
                    <p className="font-bold text-mo-title-md tablet:text-tab-title-md desktop:text-pc-title-md text-[var(--color-gray-5)] text-center">
                        아직 좋아요한 게시물이 없어요.
                    </p>
                </div>
            ) : (
                <ul
                    className="
                        flex flex-col gap-3
                        max-w-[500px] mx-auto mt-8 mb-8
                        px-[16px] tablet:px-0 desktop:px-0
                    "
                >
                    {likedPosts.map((post) => (
                        <li key={post.id}>
                            <PostCardCompact
                                post={post}
                                showInfoHeader={true}
                                showStatusBadge={true}
                                showSvgIcon={true}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}
