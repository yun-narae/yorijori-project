import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import pb from "../lib/pocketbase";
import PostCardSimple from "../components/PostCard/PostCardSimple";
import CategorySelectBadge from "../components/Badges/CategorySelectBadge";
import CategoryPageSkeleton from "../components/Skeletons/CategoryPageSkeleton";
import PageTitleBar from "../components/PageTitleBar/PageTitleBar";

const CATEGORIES = [
    "한식", "중식", "일식", "양식", "베이킹", "디저트", "기타"
];

export default function CategoryPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("");

    // URL에서 초기 카테고리 읽기
    useEffect(() => {
        const categoryFromUrl = searchParams.get('category');
        if (categoryFromUrl) {
            setSelectedCategory(categoryFromUrl);
        }
    }, [searchParams]);

    // 포스트 로드 함수
    const loadPosts = useCallback(async () => {
        try {
            setLoading(true);
            console.log('📊 포스트 로드 시작...');

            // 1단계: 카테고리 필터링된 쿼리 (API에서 직접 필터링)
            let filteredPosts = [];
            try {
                // 카테고리 필터를 API 쿼리에 직접 적용
                const response = await pb.collection("post").getList(1, 50, {
                    filter: `category ~ "${selectedCategory}"`,
                    requestKey: `category:posts:${selectedCategory}`
                });
                filteredPosts = response.items || [];
                console.log('📊 필터링된 포스트 수:', filteredPosts.length);
            } catch (error) {
                console.error('❌ 포스트 로드 실패:', error);
                return;
            }

            // 2단계: 작성자 정보는 필요할 때만 로드 (lazy loading)
            const postsWithAuthors = filteredPosts.map(post => ({
                ...post,
                expandEditor: {
                    nickname: '로딩 중...',
                    name: ''
                }
            }));

            // 3단계: 클라이언트 사이드 정렬 (created 기준)
            postsWithAuthors.sort((a, b) => {
                const dateA = new Date(a.created);
                const dateB = new Date(b.created);
                return dateB - dateA;
            });

            setPosts(postsWithAuthors);

            // 4단계: 작성자 정보 백그라운드에서 로드
            const postsWithFullAuthors = await Promise.all(
                postsWithAuthors.map(async (post) => {
                    try {
                        const author = await pb.collection("users").getOne(post.editor, {
                            requestKey: `category:author:${post.editor}`
                        });
                        return {
                            ...post,
                            expandEditor: {
                                nickname: author.nickname || author.name || '익명',
                                name: author.name
                            }
                        };
                    } catch (error) {
                        console.warn(`⚠️ 작성자 정보 로드 실패 (${post.editor}):`, error);
                        return {
                            ...post,
                            expandEditor: {
                                nickname: '익명',
                                name: ''
                            }
                        };
                    }
                })
            );

            // 작성자 정보가 로드되면 업데이트
            setPosts(postsWithFullAuthors);

        } catch (error) {
            console.error('❌ 포스트 로드 실패:', error);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [selectedCategory]);

    // 카테고리 변경 시 포스트 로드
    useEffect(() => {
        if (selectedCategory) {
            loadPosts();
        }
    }, [selectedCategory, loadPosts]);

    // 카테고리 선택 핸들러
    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setSearchParams({ category });
    };

    return (
        <>
            <PageTitleBar loading={loading} />
            
            {loading ? (
                <CategoryPageSkeleton />
            ) : (
                <div className="flex flex-col gap-4 max-w-[500px] mx-auto mt-6 desktop:mt-8 mb-8 px-4 tablet:px-0 desktop:px-0">
                    {/* 카테고리 필터 */}
                    <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {CATEGORIES.map((category) => (
                            <CategorySelectBadge
                                key={category}
                                label={category}
                                isSelected={selectedCategory === category}
                                onClick={() => handleCategorySelect(category)}
                            />
                        ))}
                    </div>
                    {/* 포스트 목록 */}
                    {posts.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {posts.map((post) => (
                                <PostCardSimple
                                    key={post.id}
                                    post={post}
                                    author={post.expandEditor}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <b className="text-[var(--color-gray-8)] text-mo-title tablet:text-tab-title desktop:text-pc-title">
                                {selectedCategory ? `${selectedCategory} 카테고리의 모임이 없습니다.` : '카테고리를 선택해주세요.'}
                            </b>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
