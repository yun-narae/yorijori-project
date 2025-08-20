import React from "react";
import { useAuth } from "../contexts/AuthContext";

export function useNavItems() {
  const { user } = useAuth();
  const myPageTo = user ? `/mypage/${user.id}` : "/login";
  const myPostsTo = user ? `/post/mypost/${user.id}` : "/login";

  return React.useMemo(() => ([
    {
      to: "/",
      label: "Home",
      header: {
        byScreen: {
          mobile: { 
            showLogo: true, showHamburger: true, showBack: false, showNav: false,
            showTitle: false, Icon2Name: null, buttonTitle: "회원가입",
            showButtonTitle: ({ user }) => !user,
            showProfile: ({ user }) => !!user,
          },
          tablet: { 
            showLogo: true, showHamburger: true, showBack: false, showNav: false,
            showTitle: false, Icon2Name: null, buttonTitle: "회원가입/로그인",
            showButtonTitle: ({ user }) => !user,
            showProfile: ({ user }) => !!user,
          },
          desktop: { 
            showLogo: true, showHamburger: false, showBack: false, showNav: true,
            showTitle: false, Icon2Name: null, buttonTitle: "회원가입/로그인",
            showButtonTitle: ({ user }) => !user,
            showProfile: ({ user }) => !!user,
          },
        },
      },
    },
    {
      to: "/register",
      label: "회원가입",
      header: {
        showButtonTitle: ({ user }) => false,
        byScreen: {
          mobile: { showLogo: false, showHamburger: false, showBack: true, showNav: false, showTitle: true, Icon2Name: null, buttonTitle: "회원가입", showProfile: false },
          tablet: { showLogo: false, showHamburger: false, showBack: true, showNav: false, showTitle: true, Icon2Name: null, buttonTitle: "회원가입/로그인", showProfile: false },
          desktop:{ showLogo: true,  showHamburger: false, showBack: false, showNav: false, showTitle: false, Icon2Name: null, buttonTitle: "회원가입/로그인", showProfile: false },
        },
      },
    },
    {
      to: "/register/success",
      header: {
        showButtonTitle: ({ user }) => false,
        byScreen: {
          mobile: { showLogo: false, showHamburger: false, showBack: true, showNav: false, showTitle: true, Icon2Name: null, buttonTitle: "회원가입", showProfile: false },
          tablet: { showLogo: false, showHamburger: false, showBack: true, showNav: false, showTitle: true, Icon2Name: null, buttonTitle: "회원가입/로그인", showProfile: false },
          desktop:{ showLogo: true,  showHamburger: false, showBack: false, showNav: false, showTitle: false, Icon2Name: null, buttonTitle: "회원가입/로그인", showProfile: false },
        },
      },
    },
    {
      to: "/login",
      label: "로그인",
      header: {
        byScreen: {
          mobile: { showLogo: false, showHamburger: false, showBack: true, showNav: false, showTitle: true, Icon2Name: null, buttonTitle: null, showProfile: false },
          tablet: { showLogo: false, showHamburger: false, showBack: true, showNav: false, showTitle: true, Icon2Name: null, buttonTitle: null, showProfile: false },
          desktop:{ showLogo: true,  showHamburger: false, showBack: false, showNav: false, showTitle: false, Icon2Name: null, buttonTitle: null, showProfile: false },
        },
      },
    },
    {
      to: "/login/find-password",
      label: "비밀번호 찾기",
      header: {
        showButtonTitle: ({ user }) => false,
        byScreen: {
          mobile: { showLogo: false, showHamburger: false, showBack: true, showNav: false, showTitle: true, Icon2Name: null, buttonTitle: "회원가입", showProfile: false },
          tablet: { showLogo: false, showHamburger: false, showBack: true, showNav: false, showTitle: true, Icon2Name: null, buttonTitle: "회원가입/로그인", showProfile: false },
          desktop:{ showLogo: true,  showHamburger: false, showBack: false, showNav: false, showTitle: false, Icon2Name: null, buttonTitle: "회원가입/로그인", showProfile: false },
        },
      },
    },
    {
      to: myPageTo,               // ✅ 실제 user.id로 치환 or /login
      label: "마이페이지",
      header: {
        byScreen: {
          mobile:  { showLogo: false, showHamburger: false, showBack: true, showNav: false, showTitle: true, Icon2Name: null, showProfile: false },
          tablet:  { showLogo: false, showHamburger: false, showBack: true, showNav: false, showTitle: true, Icon2Name: null, showProfile: false },
          desktop: { showLogo: true,  showHamburger: false, showBack: false, showNav: true,  showTitle: false, Icon2Name: null, buttonTitle: "회원가입/로그인", showButtonTitle: ({ user }) => !user, showProfile: false },
        },
      },
    },
    {
      to: "/post/create",
      label: "요리모임 등록하기",
      header: {
        byScreen: {
          mobile:  { showLogo: true,  showHamburger: false, showBack: false, showNav: false, showTitle: true,  Icon2Name: null, buttonTitle: null, showProfile: false },
          tablet:  { showLogo: true,  showHamburger: false, showBack: false, showNav: false, showTitle: true,  Icon2Name: null, buttonTitle: null, showProfile: false },
          desktop: { showLogo: true,  showHamburger: false, showBack: false, showNav: false, showTitle: false, Icon2Name: null, buttonTitle: null, showProfile: false },
        },
      },
    },
    {
      to: myPostsTo,              // ✅ 실제 user.id로 치환 or /login
      label: "작성한 모임",
      header: {
        byScreen: {
          mobile:  { showLogo: false, showHamburger: false, showBack: true, showNav: false, showTitle: true, Icon2Name: null, buttonTitle: null, showProfile: false },
          tablet:  { showLogo: false, showHamburger: false, showBack: true, showNav: false, showTitle: true, Icon2Name: null, buttonTitle: null, showProfile: false },
          desktop: { showLogo: true,  showHamburger: false, showBack: false, showNav: false, showTitle: false, Icon2Name: null, buttonTitle: null, showProfile: false },
        },
      },
    },
    {
      to: "/post/detail/:postId",
      header: {
        byScreen: {
          mobile:  { showLogo: false, showHamburger: true,  showBack: true,  showNav: false, showTitle: false, Icon2Name: null, buttonTitle: null, showProfile: false },
          tablet:  { showLogo: false, showHamburger: true,  showBack: true,  showNav: false, showTitle: false, Icon2Name: null, buttonTitle: null, showProfile: false },
          desktop: { showLogo: false, showHamburger: false, showBack: true,  showNav: true,  showTitle: false, Icon2Name: null, buttonTitle: null, showProfile: false },
        },
      },
    },
  ]), [user]);
}
