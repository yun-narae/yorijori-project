import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import PageTitleBar from "../components/PageTitleBar/PageTitleBar";
import PostCardCompact from "../components/PostCard/PostCardCompact";
import CategorySelectBadge from "../components/Badges/CategorySelectBadge";
import PostCardSkeleton from "../components/Skeletons/PostCardSkeleton";
import pb from "../lib/pocketbase";
import { useAuth } from "../contexts/AuthContext";

const CATEGORIES = ["한식", "양식", "일식", "브런치", "중식", "분식", "베이킹"];

/** 문자열/JSON/배열/콤마구분 등 모든 경우를 배열로 정규화 */
function normalizeCategories(raw) {
    // 이미 배열
    if (Array.isArray(raw)) {
        return raw.map((s) => String(s).trim());
    }
    // 비어있음
    if (raw == null) return [];

    // 문자열인 경우
    if (typeof raw === "string") {
        const txt = raw.trim();

        // JSON 배열 문자열: '["한식","브런치"]'
        if ((txt.startsWith("[") && txt.endsWith("]")) || (txt.startsWith('"') && txt.endsWith('"'))) {
            try {
                const arr = JSON.parse(txt);
                return Array.isArray(arr) ? arr.map((s) => String(s).trim()) : [String(txt)];
            } catch {
                // 실패 시 아래 콤마 분기
            }
        }

        // 콤마 구분: "한식, 브런치"
        if (txt.includes(",")) {
            return txt.split(",").map((s) => s.trim()).filter(Boolean);
        }

        // 단일 문자열
        return [txt];
    }

    // 그 외 타입은 문자열화
    return [String(raw)];
}

/** 안전한 날짜 포맷 */
function formatPBDate(v) {
    try {
        const d = new Date(v);
        if (isNaN(d.getTime())) return ""; // Invalid Date 방지
        return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    } catch {
        return "";
    }
}

export default function CategoryPage() {
    const { user: me } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const [selectedCategory, setSelectedCategory] = useState("");
    const [posts, setPosts] = useState(null); // null: 로딩, []: 없음, [...]: 데이터
    const [errorMsg, setErrorMsg] = useState("");
    const loadingRef = useRef(false);

    // URL에서 초기 카테고리 반영
    useEffect(() => {
        const init = searchParams.get("category");
        if (init && CATEGORIES.includes(init)) setSelectedCategory(init);
    }, [searchParams]);

    /** 목록 로드 + 필터 */
    const loadPosts = useCallback(async (category) => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setErrorMsg("");
        setPosts(null);

        try {
            if (!category) {
                setPosts([]);
                return;
            }

            // 안전한 방식으로 포스트 로드 (정렬 없이)
            let list;
            try {
                list = await pb.collection("post").getList(1, 50);
            } catch (e1) {
                console.error("포스트 로드 실패:", e1);
                setPosts([]);
                return;
            }

            const items = Array.isArray(list?.items) ? list.items : [];
            console.log("📊 전체 포스트 수:", items.length);
            console.log("🔍 검색 카테고리:", category);
            
            // 클라이언트 사이드에서 최신순 정렬
            const sortedItems = items.sort((a, b) => {
                const dateA = new Date(a.created || 0);
                const dateB = new Date(b.created || 0);
                return dateB.getTime() - dateA.getTime();
            });
            
            // 작성자 정보 디버깅
            if (sortedItems.length > 0) {
                const firstPost = sortedItems[0];
                console.log("👤 첫 번째 포스트 작성자 정보 (로드 전):", {
                    editor: firstPost.editor,
                    expandEditor: firstPost.expand?.editor,
                    nickname: firstPost.expand?.editor?.nickname,
                    name: firstPost.expand?.editor?.name
                });
            }

            // 클라이언트 필터 (서버 필드가 확정되면 filter로 옮기자)
            const filtered = sortedItems.filter((rec) => {
                // 우선순위: categories, category, tags 같은 필드들 차례로 검사
                const cat =
                    normalizeCategories(rec.categories) // 멀티셀렉트/배열
                        .concat(normalizeCategories(rec.category)) // 단일/문자열/JSON
                        .concat(normalizeCategories(rec.tags)); // 다른 이름 대비

                // 중복 제거
                const uniq = Array.from(new Set(cat));
                const matches = uniq.includes(category);
                
                if (matches) {
                    console.log("✅ 매칭된 포스트:", rec.title, "카테고리:", uniq);
                }
                
                return matches;
            });

            console.log("🎯 필터링된 포스트 수:", filtered.length);
            
            // 작성자 정보를 개별적으로 로드
            const postsWithAuthors = await Promise.all(
                filtered.map(async (post) => {
                    try {
                        // editor ID가 있으면 사용자 정보 가져오기
                        if (post.editor) {
                            const editorId = typeof post.editor === 'string' ? post.editor : post.editor.id;
                            const user = await pb.collection('users').getOne(editorId);
                            return {
                                ...post,
                                expand: {
                                    ...post.expand,
                                    editor: user
                                }
                            };
                        }
                        return post;
                    } catch (error) {
                        console.log("작성자 정보 로드 실패:", post.title, error);
                        return post;
                    }
                })
            );
            
            // 작성자 정보 로드 후 디버깅
            if (postsWithAuthors.length > 0) {
                const firstPostWithAuthor = postsWithAuthors[0];
                console.log("👤 첫 번째 포스트 작성자 정보 (로드 후):", {
                    editor: firstPostWithAuthor.editor,
                    expandEditor: firstPostWithAuthor.expand?.editor,
                    nickname: firstPostWithAuthor.expand?.editor?.nickname,
                    name: firstPostWithAuthor.expand?.editor?.name
                });
            }
            
            setPosts(postsWithAuthors);
        } catch (err) {
            console.group("%c[Category] 목록 로드 실패", "color:#d33;font-weight:bold");
            console.log(err);
            console.groupEnd();
            setErrorMsg("목록을 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
            setPosts([]);
        } finally {
            loadingRef.current = false;
        }
    }, []);

    const isLoading = posts === null;

    // 초기 로드
    useEffect(() => {
        if (selectedCategory) {
            loadPosts(selectedCategory);
        }
    }, [selectedCategory, loadPosts]);

    const onSelect = (cat) => {
        const next = cat === selectedCategory ? "" : cat;
        setSelectedCategory(next);
        setSearchParams(next ? { category: next } : {});
        loadPosts(next);
    };

    return (
        <>
            <PageTitleBar title="카테고리" loading={isLoading} />

            {/* 카테고리 선택 */}
            <div className="max-w-[500px] mx-auto px-4 tablet:px-0 desktop:px-0 mt-6">
                <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {CATEGORIES.map((c) => (
                        <CategorySelectBadge
                            key={c}
                            label={c}
                            isSelected={selectedCategory === c}
                            onClick={() => onSelect(c)}
                        />
                    ))}
                </div>
            </div>

            {/* 리스트 */}
            {isLoading ? (
                <PostCardSkeleton />
            ) : posts.length === 0 ? (
                <div className="h-[40vh] flex flex-col items-center justify-center px-6">
                    <p className="font-bold text-[var(--color-gray-6)] text-center">
                        {errorMsg
                            ? errorMsg
                            : selectedCategory
                            ? `${selectedCategory} 카테고리의 모임이 없어요.`
                            : "카테고리를 선택해주세요."}
                    </p>
                </div>
            ) : (
                <ul className="max-w-[500px] mx-auto mt-4 space-y-3 px-4 tablet:px-0 desktop:px-0">
                    {posts.map((post) => (
                        <li key={post.id}>
                            <PostCardCompact
                                post={{
                                    ...post,
                                    // 날짜 포맷 보정 (PostCardCompact에서 바로 표시한다면 제거 가능)
                                    createdText: formatPBDate(post.created),
                                }}
                                user={me}
                                showInfoHeader
                                showStatusBadge
                                showSvgIcon
                            />
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}
