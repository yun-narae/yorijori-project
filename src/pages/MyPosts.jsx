import React, { useEffect, useState } from "react";
import pb from "../lib/pocketbase";
import { useAuth } from "../contexts/AuthContext";
import PageTitleBar from "../components/PageTitleBar/PageTitleBar";
import PostCardCompact from "../components/PostCard/PostCardCompact";
import PostCardCover from "../components/PostCard/PostCardCover";
import PostCardSimple from "../components/PostCard/PostCardSimple";

export default function MyPosts() {
    const { user } = useAuth();
    const userId = user?.id;
    const [userPosts, setUserPosts] = useState([]);

    useEffect(() => {
        if (!userId) return;
    
        const AUTHOR_FIELD = "editor";
    
        const fetchUserPosts = async () => {
            try {
                const result = await pb.collection("post").getList(1, 50, {
                    filter: `${AUTHOR_FIELD}="${userId}"`,
                    expand: AUTHOR_FIELD,
                    fields: [
                        "id",
                        "title",
                        "description",
                        "category",
                        "images",
                        "capacity",
                        "collectionId",
                        "collectionName",
                        "location",
                        "date",
                        "fee",
                        "timeStart",
                        "timeEnd",
                        "likeCount",
                        "commentCount",
                        "editor",
                        "updated",
                        "created",
                    ].join(","),
                });
                setUserPosts(result.items ?? []);
            } catch (err) {
                console.error("게시물 가져오기 실패:", err?.status, err?.message, err?.data);
            }
        };
    
        fetchUserPosts();
    }, [userId]);

    return (
        <>
            <PageTitleBar />
    
            <ul className="
                flex flex-col gap-3
                max-w-[500px] mx-auto mt-8 mb-8
                px-4
                tablet:px-0
                desktop:px-0
            ">
                {userPosts.map((post) => (
                        <PostCardCompact
                            post={post} 
                            user={user} 
                            currentUserId={user?.id} 
                            key={post.id}
                        />
                        // <PostCardSimple
                        //     post={post} 
                        //     user={user} 
                        //     currentUserId={user?.id} 
                        //     key={post.id}
                        // />
                        // <PostCardCover
                        //     post={post} 
                        //     user={user} 
                        //     currentUserId={user?.id} 
                        //     key={post.id}
                        // />
                ))}
            </ul>
        </>
    );
}
