// src/lib/NavItems.js
import React from "react";
import { generatePath } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function useNavItems() {
    const { user } = useAuth();

    const myPageTo = user
        ? generatePath("/mypage/:userId", { userId: user.id })
        : "/mypage";

    const myPostsTo = user
        ? generatePath("/post/mypost/:userId", { userId: user.id })
        : "/login";

    const myLikesTo = user
        ? generatePath("/post/likes/:userId", { userId: user.id })
        : "/login";

    const myParticipationTo = user
        ? generatePath("/post/participation/:userId", { userId: user.id })
        : "/login";

    const createTo = user ? "/post/create" : "/login";

    return React.useMemo(
        () => [
            // 홈
            {
                to: "/",
                label: "Home",
                showInNav: false,
                header: {
                    byScreen: {
                        mobile: {
                            showLogo: true,
                            showHamburger: true,
                            showBack: false,
                            showNav: false,
                            showTitle: false,
                            Icon2Name: null,
                            buttonTitle: "회원가입",
                            showProfile: false,
                        },
                        tablet: {
                            showLogo: true,
                            showHamburger: true,
                            showBack: false,
                            showNav: false,
                            showTitle: false,
                            Icon2Name: null,
                            buttonTitle: "회원가입/로그인",
                            showProfile: false,
                        },
                        desktop: {
                            showLogo: true,
                            showHamburger: false,
                            showBack: false,
                            showNav: true,
                            showTitle: false,
                            Icon2Name: null,
                            buttonTitle: "회원가입/로그인",
                            showButtonTitle: ({ user }) => !user, // 로그인 전용 노출
                            showProfile: ({ user }) => user, // 로그아웃 전용 노출
                        },
                    },
                },
            },

            {
                to: "/posts/recent",
                label: "최근 등록된 모임",
                showInNav: false,
                header: {
                    byScreen: {
                        mobile: {
                            showLogo: false,
                            showHamburger: false,
                            showBack: true,
                            showNav: false,
                            showTitle: true,
                            Icon2Name: null,
                            buttonTitle: "회원가입",
                            showProfile: false,
                        },
                        tablet: {
                            showLogo: false,
                            showHamburger: false,
                            showBack: true,
                            showNav: false,
                            showTitle: true,
                            Icon2Name: null,
                            buttonTitle: "회원가입/로그인",
                            showProfile: false,
                        },
                        desktop: {
                            showLogo: true,
                            showHamburger: false,
                            showBack: false,
                            showNav: false,
                            showTitle: false,
                            Icon2Name: null,
                            buttonTitle: "회원가입/로그인",
                            showProfile: false,
                        },
                    },
                },
            },

            // 카테고리 페이지
            {
                to: "/category",
                label: "카테고리 별 모임",
                showInNav: false,
                header: {
                    byScreen: {
                        mobile: {
                            showLogo: false,
                            showHamburger: false,
                            showBack: true,
                            showNav: false,
                            showTitle: true,
                            Icon2Name: null,
                            buttonTitle: "회원가입",
                            showProfile: false,
                        },
                        tablet: {
                            showLogo: false,
                            showHamburger: false,
                            showBack: true,
                            showNav: false,
                            showTitle: true,
                            Icon2Name: null,
                            buttonTitle: "회원가입/로그인",
                            showProfile: false,
                        },
                        desktop: {
                            showLogo: true,
                            showHamburger: false,
                            showBack: false,
                            showNav: false,
                            showTitle: false,
                            Icon2Name: null,
                            buttonTitle: "회원가입/로그인",
                            showProfile: false,
                        },
                    },
                },
            },

            // 회원가입
            {
                to: "/register",
                label: "회원가입",
                showInNav: false,
                header: {
                    showButtonTitle: ({ user }) => false,
                    byScreen: {
                        mobile: {
                            showLogo: false,
                            showHamburger: false,
                            showBack: true,
                            showNav: false,
                            showTitle: true,
                            Icon2Name: null,
                            buttonTitle: "회원가입",
                            showProfile: false,
                        },
                        tablet: {
                            showLogo: false,
                            showHamburger: false,
                            showBack: true,
                            showNav: false,
                            showTitle: true,
                            Icon2Name: null,
                            buttonTitle: "회원가입/로그인",
                            showProfile: false,
                        },
                        desktop: {
                            showLogo: true,
                            showHamburger: false,
                            showBack: false,
                            showNav: false,
                            showTitle: false,
                            Icon2Name: null,
                            buttonTitle: "회원가입/로그인",
                            showProfile: false,
                        },
                    },
                },
            },

            // 회원가입 완료
            {
                to: "/register/success",
                label: "회원가입 완료",
                showInNav: false,
                header: {
                    showButtonTitle: ({ user }) => false,
                    byScreen: {
                        mobile: {
                            showLogo: false,
                            showHamburger: false,
                            showBack: true,
                            showNav: false,
                            showTitle: true,
                            Icon2Name: null,
                            buttonTitle: "회원가입",
                            showProfile: false,
                        },
                        tablet: {
                            showLogo: false,
                            showHamburger: false,
                            showBack: true,
                            showNav: false,
                            showTitle: true,
                            Icon2Name: null,
                            buttonTitle: "회원가입/로그인",
                            showProfile: false,
                        },
                        desktop: {
                            showLogo: true,
                            showHamburger: false,
                            showBack: false,
                            showNav: false,
                            showTitle: false,
                            Icon2Name: null,
                            buttonTitle: "회원가입/로그인",
                            showProfile: false,
                        },
                    },
                },
            },

            // 로그인
            {
                to: "/login",
                label: "로그인",
                showInNav: false,
                header: {
                    byScreen: {
                        mobile: {
                            showLogo: false,
                            showHamburger: false,
                            showBack: true,
                            showNav: false,
                            showTitle: true,
                            Icon2Name: null,
                            buttonTitle: null,
                            showProfile: false,
                        },
                        tablet: {
                            showLogo: false,
                            showHamburger: false,
                            showBack: true,
                            showNav: false,
                            showTitle: true,
                            Icon2Name: null,
                            buttonTitle: null,
                            showProfile: false,
                        },
                        desktop: {
                            showLogo: true,
                            showHamburger: false,
                            showBack: false,
                            showNav: false,
                            showTitle: false,
                            Icon2Name: null,
                            buttonTitle: null,
                            showProfile: false,
                        },
                    },
                },
            },

            // 비밀번호 찾기
            {
                to: "/login/find-password",
                label: "비밀번호 찾기",
                showInNav: false,
                header: {
                    showButtonTitle: ({ user }) => false,
                    byScreen: {
                        mobile: {
                            showLogo: false,
                            showHamburger: false,
                            showBack: true,
                            showNav: false,
                            showTitle: true,
                            Icon2Name: null,
                            buttonTitle: "회원가입",
                            showProfile: false,
                        },
                        tablet: {
                            showLogo: false,
                            showHamburger: false,
                            showBack: true,
                            showNav: false,
                            showTitle: true,
                            Icon2Name: null,
                            buttonTitle: "회원가입/로그인",
                            showProfile: false,
                        },
                        desktop: {
                            showLogo: true,
                            showHamburger: false,
                            showBack: false,
                            showNav: false,
                            showTitle: false,
                            Icon2Name: null,
                            buttonTitle: "회원가입/로그인",
                            showProfile: false,
                        },
                    },
                },
            },

            // 다른 유저 마이페이지도 매칭되도록 추가
            {
                to: "/mypage/:userId",
                showInNav: false,
                header: {
                    byScreen: {
                        mobile: {
                            showLogo: false,
                            showHamburger: false,
                            showBack: true,
                            showNav: false,
                            showTitle: true,
                            Icon2Name: null,
                            showProfile: false,
                        },
                        tablet: {
                            showLogo: false,
                            showHamburger: false,
                            showBack: true,
                            showNav: false,
                            showTitle: true,
                            Icon2Name: null,
                            showProfile: false,
                        },
                        desktop: {
                            showLogo: true,
                            showHamburger: false,
                            showBack: false,
                            showNav: true,
                            showTitle: false,
                            Icon2Name: null,
                            buttonTitle: null,
                            showProfile: false,
                        },
                    },
                },
            },

            // (내 페이지) 동적 경로: 정확 매칭 시에는 이 항목이 적용됨
            {
                to: myPageTo,
                label: "마이페이지",
                showInNav: false,
                header: {
                    byScreen: {
                        mobile: {
                            showLogo: false,
                            showHamburger: false,
                            showBack: true,
                            showNav: false,
                            showTitle: true,
                            Icon2Name: null,
                            showProfile: false,
                        },
                        tablet: {
                            showLogo: false,
                            showHamburger: false,
                            showBack: true,
                            showNav: false,
                            showTitle: true,
                            Icon2Name: null,
                            showProfile: false,
                        },
                        desktop: {
                            showLogo: true,
                            showHamburger: false,
                            showBack: false,
                            showNav: true,
                            showTitle: false,
                            Icon2Name: null,
                            buttonTitle: "회원가입/로그인",
                            showButtonTitle: ({ user }) => !user,
                            showProfile: false,
                        },
                    },
                },
            },

            {
                to: "/mypage/edit",
                label: "내 정보 수정",
                showInNav: false,
                header: {
                    byScreen: {
                        mobile: {
                            showLogo: false,
                            showHamburger: false,
                            showBack: true,
                            showNav: false,
                            showTitle: true,
                            Icon2Name: null,
                            showProfile: false,
                        },
                        tablet: {
                            showLogo: false,
                            showHamburger: false,
                            showBack: true,
                            showNav: false,
                            showTitle: true,
                            Icon2Name: null,
                            showProfile: false,
                        },
                        desktop: {
                            showLogo: true,
                            showHamburger: false,
                            showBack: false,
                            showNav: false,
                            showTitle: false,
                            Icon2Name: null,
                            showButtonTitle: ({ user }) => !user,
                            showProfile: false,
                        },
                    },
                },
            },

            // 모임 등록하기
            {
                to: createTo,
                label: "모임 만들기",
                showInNav: true,
                header: {
                    byScreen: {
                        mobile: {
                            showLogo: true,
                            showHamburger: false,
                            showBack: false,
                            showNav: false,
                            showTitle: true,
                            Icon2Name: null,
                            buttonTitle: null,
                            showProfile: false,
                        },
                        tablet: {
                            showLogo: true,
                            showHamburger: false,
                            showBack: false,
                            showNav: false,
                            showTitle: true,
                            Icon2Name: null,
                            buttonTitle: null,
                            showProfile: false,
                        },
                        desktop: {
                            showLogo: true,
                            showHamburger: false,
                            showBack: false,
                            showNav: false,
                            showTitle: false,
                            Icon2Name: null,
                            buttonTitle: null,
                            showProfile: false,
                        },
                    },
                },
            },

            // 작성한 모임 (동적)
            {
                to: myPostsTo,
                label: "작성한 모임",
                showInNav: true,
                header: {
                    byScreen: {
                        mobile: {
                            showLogo: false,
                            showHamburger: false,
                            showBack: true,
                            showNav: false,
                            showTitle: true,
                            Icon2Name: null,
                            buttonTitle: null,
                            showProfile: false,
                        },
                        tablet: {
                            showLogo: false,
                            showHamburger: false,
                            showBack: true,
                            showNav: false,
                            showTitle: true,
                            Icon2Name: null,
                            buttonTitle: null,
                            showProfile: false,
                        },
                        desktop: {
                            showLogo: true,
                            showHamburger: false,
                            showBack: false,
                            showNav: false,
                            showTitle: false,
                            Icon2Name: null,
                            buttonTitle: null,
                            showProfile: false,
                        },
                    },
                },
            },

            // 다른 유저의 마이포스트도 매칭되도록 추가
            {
                to: "/post/mypost/:userId",
                label: "작성한 모임",
                showInNav: false,
                header: {
                    byScreen: {
                        mobile: {
                            showLogo: false,
                            showHamburger: false,
                            showBack: true,
                            showNav: false,
                            showTitle: true,
                            Icon2Name: null,
                            buttonTitle: null,
                            showProfile: false,
                        },
                        tablet: {
                            showLogo: false,
                            showHamburger: false,
                            showBack: true,
                            showNav: false,
                            showTitle: true,
                            Icon2Name: null,
                            buttonTitle: null,
                            showProfile: false,
                        },
                        desktop: {
                            showLogo: true,
                            showHamburger: false,
                            showBack: false,
                            showNav: false,
                            showTitle: false,
                            Icon2Name: null,
                            buttonTitle: null,
                            showProfile: false,
                        },
                    },
                },
            },

            // 모임 상세
            {
                to: "/post/detail/:postId",
                label: "모임 상세페이지",
                showInNav: false,
                header: {
                    byScreen: {
                        mobile: {
                            showLogo: false,
                            showHamburger: true,
                            showBack: true,
                            showNav: false,
                            showTitle: false,
                            Icon2Name: null,
                            buttonTitle: null,
                            showProfile: false,
                        },
                        tablet: {
                            showLogo: false,
                            showHamburger: true,
                            showBack: true,
                            showNav: false,
                            showTitle: false,
                            Icon2Name: null,
                            buttonTitle: null,
                            showProfile: false,
                        },
                        desktop: {
                            showLogo: false,
                            showHamburger: false,
                            showBack: true,
                            showNav: false,
                            showTitle: false,
                            Icon2Name: null,
                            buttonTitle: null,
                            showProfile: false,
                        },
                    },
                },
            },

            // 모임 수정
            {
                to: "/post/edit/:postId",
                label: "모임 수정하기",
                showInNav: false,
                header: {
                    byScreen: {
                        mobile: {
                            showLogo: false,
                            showHamburger: false,
                            showBack: true,
                            showNav: false,
                            showTitle: true,
                            Icon2Name: null,
                            buttonTitle: null,
                            showProfile: false,
                        },
                        tablet: {
                            showLogo: false,
                            showHamburger: false,
                            showBack: true,
                            showNav: false,
                            showTitle: true,
                            Icon2Name: null,
                            buttonTitle: null,
                            showProfile: false,
                        },
                        desktop: {
                            showLogo: true,
                            showHamburger: false,
                            showBack: false,
                            showNav: false,
                            showTitle: false,
                            Icon2Name: null,
                            buttonTitle: null,
                            showProfile: false,
                        },
                    },
                },
            },

            // 찜한 모임 (동적)
            {
                to: myLikesTo,
                label: "찜한 모임",
                showInNav: true,
                header: {
                    byScreen: {
                        mobile: { showLogo: false, showHamburger: false, showBack: true, showNav: false, showTitle: true, Icon2Name: null, buttonTitle: null, showProfile: false },
                        tablet: { showLogo: false, showHamburger: false, showBack: true, showNav: false, showTitle: true, Icon2Name: null, buttonTitle: null, showProfile: false },
                        desktop: { showLogo: true, showHamburger: false, showBack: false, showNav: false, showTitle: false, Icon2Name: null, buttonTitle: null, showProfile: false },
                    },
                },
            },

            // 다른 유저의 찜 목록 경로 매칭
            {
                to: "/post/likes/:userId",
                label: "찜한 모임",
                showInNav: false,
                header: {
                    byScreen: {
                        mobile: { showLogo: false, showHamburger: false, showBack: true, showNav: false, showTitle: true, Icon2Name: null, buttonTitle: null, showProfile: false },
                        tablet: { showLogo: false, showHamburger: false, showBack: true, showNav: false, showTitle: true, Icon2Name: null, buttonTitle: null, showProfile: false },
                        desktop: { showLogo: true, showHamburger: false, showBack: false, showNav: false, showTitle: false, Icon2Name: null, buttonTitle: null, showProfile: false },
                    },
                },
            },

            // 예약한 모임 (동적)
            {
                to: myParticipationTo,
                label: "예약한 모임",
                showInNav: true,
                header: {
                    byScreen: {
                        mobile: { showLogo: false, showHamburger: false, showBack: true, showNav: false, showTitle: true, Icon2Name: null, buttonTitle: null, showProfile: false },
                        tablet: { showLogo: false, showHamburger: false, showBack: true, showNav: false, showTitle: true, Icon2Name: null, buttonTitle: null, showProfile: false },
                        desktop: { showLogo: true, showHamburger: false, showBack: false, showNav: false, showTitle: false, Icon2Name: null, buttonTitle: null, showProfile: false },
                    },
                },
            },

            // 다른 유저의 예약 목록 경로 매칭
            {
                to: "/post/participation/:userId",
                label: "예약한 모임",
                showInNav: false,
                header: {
                    byScreen: {
                        mobile: { showLogo: false, showHamburger: false, showBack: true, showNav: false, showTitle: true, Icon2Name: null, buttonTitle: null, showProfile: false },
                        tablet: { showLogo: false, showHamburger: false, showBack: true, showNav: false, showTitle: true, Icon2Name: null, buttonTitle: null, showProfile: false },
                        desktop: { showLogo: true, showHamburger: false, showBack: false, showNav: false, showTitle: false, Icon2Name: null, buttonTitle: null, showProfile: false },
                    },
                },
            },
        ],
        [user, myPageTo, myPostsTo, createTo]
    );
}
