# 요리조리 🍳

요리 모임을 만들고 참여할 수 있는 웹 애플리케이션

## 🔗 Links

| 구분 | 링크 |
|------|------|
| 🧑‍💻 **Code Repository** | [GitHub – yun-narae/yorijori-project](https://github.com/yun-narae/yorijori-project) |
| 🌐 **Live Site** | [https://yorijori-project.netlify.app](https://yorijori-project.netlify.app/) |
| 🎨 **Figma Design** | [Figma – 요리조리 프로젝트 디자인](https://www.figma.com/design/5ciRroQPBXch89GZH00bXG/%EC%9A%94%EB%A6%AC%EC%A1%B0%EB%A6%AC?node-id=95-238&t=vYjyPCfa6nmNz630-1) |
| 📘 **Storybook** | [Storybook – Components Documentation](https://68405fe9d2dbe29f4a848815-alwrcaaikd.chromatic.com/?path=/docs/components-actions-editanddelete--docs&globals=theme:light) |


## 📋 목차

- [프로젝트 소개](#프로젝트-소개)
- [기술 스택](#기술-스택)
- [설치 및 실행](#설치-및-실행)
- [주요 기능](#주요-기능)
- [프로젝트 구조](#프로젝트-구조)
- [기여하기](#기여하기)

---

## 🚀 프로젝트 소개

‘요리로 사람을 이어주는 커뮤니티’를 목표로 제작한 개인 프로젝트입니다.
PocketBase를 기반으로 댓글·찜·참여하기 등 핵심 기능의 데이터 구조를 직접 설계하고,
로컬 스냅샷과 서버 간 상태 동기화를 통해 안정적인 사용자 경험을 구현했습니다.
Skeleton·낙관적 업데이트·에러 처리 등 비동기 UX 패턴을 적용해 체감 속도를 개선하고,
Storybook으로 컴포넌트를 문서화하며 디자인 일관성과 유지보수성을 높였습니다.

### 🎯 핵심 기능
- **모임 관리**: 요리 모임 생성, 수정, 삭제 및 이미지 업로드
- **예약 시스템**: 모임 참여 예약 및 취소 기능
- **소셜 기능**: 댓글 작성, 모임 찜하기, 사용자 프로필 관리
- **카테고리 분류**: 한식, 중식, 일식, 양식 등 요리 카테고리별 모임 조회
- **실시간 동기화**: 댓글, 찜, 예약 상태의 실시간 업데이트
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 모든 환경 지원
- **다크모드**: 사용자 선호에 따른 테마 전환 기능

### 🛠️ 주요 기술적 성과
- **데이터 설계**: PocketBase 컬렉션/릴레이션 설계 및 최적화
- **상태 동기화**: 댓글·찜·참여하기의 로컬 스냅샷 ↔ 서버 실시간 동기화
- **데이터 정합성**: 삭제/탈퇴 시 연쇄 정리 및 정합성 보장 시스템
- **사용자 경험**: 접근성/반응형/다크모드 기본값화
- **성능 최적화**: 비동기 UX(스켈레톤 최소 노출·낙관적 업데이트)
- **아키텍처**: 재사용 가능한 컴포넌트 설계 및 모듈화
- **품질 관리**: 에러/경계 상태 처리, Storybook 기반 문서화와 UI 회귀 방지

### 📅 프로젝트 정보
- **개발 기간**: 2025.07 ~ 2025.11
- **기여도**: 100% (단독 개발)
- **담당 역할**: 기획 · 디자인 · 프론트엔드 개발 · 백엔드 연동

---

## 🛠 기술 스택

| 분야 | 기술 |
|------|------|
| **Frontend** | React 18, Vite, TailwindCSS |
| **Backend** | PocketBase |
| **상태관리** | React Context API |
| **라우팅** | React Router v6 |
| **UI 컴포넌트** | Custom Components, Swiper.js |
| **개발도구** | ESLint, Prettier |

---

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/yun-narae/yorijori-project.git
cd yorijori-project
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경변수 설정
```bash
cp .env.example .env
```

### 4. 개발 서버 실행
```bash
npm run dev
```

---

## ✨ 주요 기능

### 🔐 인증 및 사용자 관리

| 기능 | 설명 | 이미지 |
|------|------|--------|
| **회원가입** | 이메일, 닉네임, 비밀번호로 계정 생성 | <img src="https://lengthy-silver-7okhndbu6c.edgeone.app/01%E1%84%92%E1%85%AC%E1%84%8B%E1%85%AF%E1%86%AB%E1%84%80%E1%85%A1%E1%84%8B%E1%85%B5%E1%86%B8.gif" width="200" alt="회원가입"> |
| **회원탈퇴** | 계정 삭제 및 관련 데이터 정리 | <img src="https://lengthy-silver-7okhndbu6c.edgeone.app/02%E1%84%92%E1%85%AC%E1%84%8B%E1%85%AF%E1%86%AB%E1%84%90%E1%85%A1%E1%86%AF%E1%84%90%E1%85%AC.gif" width="200" alt="회원탈퇴"> |
| **로그인** | 이메일/비밀번호로 로그인 | <img src="https://lengthy-silver-7okhndbu6c.edgeone.app/03%E1%84%85%E1%85%A9%E1%84%80%E1%85%B3%E1%84%8B%E1%85%B5%E1%86%AB.gif" width="200" alt="로그인"> |
| **로그아웃** | 세션 종료 및 로그아웃 | <img src="https://lengthy-silver-7okhndbu6c.edgeone.app/04%E1%84%85%E1%85%A9%E1%84%80%E1%85%B3%E1%84%8B%E1%85%A1%E1%84%8B%E1%85%AE%E1%86%BA.gif" width="200" alt="로그아웃"> |
| **로그인 검증 모달창** | 로그인 필요 시 모달 표시 | <img src="https://lengthy-silver-7okhndbu6c.edgeone.app/05%E1%84%85%E1%85%A9%E1%84%80%E1%85%B3%E1%84%8B%E1%85%B5%E1%86%AB%20%E1%84%80%E1%85%A5%E1%86%B7%E1%84%8C%E1%85%B3%E1%86%BC%20%E1%84%86%E1%85%A9%E1%84%83%E1%85%A1%E1%86%AF%E1%84%8E%E1%85%A1%E1%86%BC.gif" width="200" alt="로그인 검증 모달창"> |
| **로그인 오류모달** | 로그인 실패 시 오류 메시지 | <img src="https://lengthy-silver-7okhndbu6c.edgeone.app/06%E1%84%85%E1%85%A9%E1%84%80%E1%85%B3%E1%84%8B%E1%85%B5%E1%86%AB%20%E1%84%8B%E1%85%A9%E1%84%85%E1%85%B2%E1%84%86%E1%85%A9%E1%84%83%E1%85%A1%E1%86%AF.gif" width="200" alt="로그인 오류모달"> |
| **비밀번호 찾기** | 이메일로 비밀번호 복구 | <img src="https://lengthy-silver-7okhndbu6c.edgeone.app/07%E1%84%87%E1%85%B5%E1%84%86%E1%85%B5%E1%86%AF%E1%84%87%E1%85%A5%E1%86%AB%E1%84%92%E1%85%A9%20%E1%84%8E%E1%85%A1%E1%86%BD%E1%84%80%E1%85%B5.gif" width="200" alt="비밀번호 찾기"> |

### 🍽️ 모임 관리

| 기능 | 설명 | 이미지 |
|------|------|--------|
| **모임 등록하기** | 새로운 요리 모임 생성 | <img src="https://lengthy-silver-7okhndbu6c.edgeone.app/08%E1%84%86%E1%85%A9%E1%84%8B%E1%85%B5%E1%86%B7%20%E1%84%83%E1%85%B3%E1%86%BC%E1%84%85%E1%85%A9%E1%86%A8%E1%84%92%E1%85%A1%E1%84%80%E1%85%B5.gif" width="200" alt="모임 등록하기"> |
| **모임 찜하기** | 관심 있는 모임을 찜 목록에 추가 | <img src="https://lengthy-silver-7okhndbu6c.edgeone.app/09%E1%84%86%E1%85%A9%E1%84%8B%E1%85%B5%E1%86%B7%20%E1%84%8D%E1%85%B5%E1%86%B7%E1%84%92%E1%85%A1%E1%84%80%E1%85%B5.gif" width="200" alt="모임 찜하기"> |
| **모임 수정하기** | 등록한 모임 정보 수정 | <img src="https://lengthy-silver-7okhndbu6c.edgeone.app/10%E1%84%86%E1%85%A9%E1%84%8B%E1%85%B5%E1%86%B7%20%E1%84%89%E1%85%AE%E1%84%8C%E1%85%A5%E1%86%BC%E1%84%92%E1%85%A1%E1%84%80%E1%85%B5.gif" width="200" alt="모임 수정하기"> |
| **모임 삭제하기** | 등록한 모임 삭제 | <img src="https://lengthy-silver-7okhndbu6c.edgeone.app/11%E1%84%86%E1%85%A9%E1%84%8B%E1%85%B5%E1%86%B7%20%E1%84%89%E1%85%A1%E1%86%A8%E1%84%8C%E1%85%A6%E1%84%92%E1%85%A1%E1%84%80%E1%85%B5.gif" width="200" alt="모임 삭제하기"> |
| **모임 등록하기 (Step-by-step)** | 단계별 모임 등록 프로세스 | <img src="https://lengthy-silver-7okhndbu6c.edgeone.app/12%E1%84%86%E1%85%A9%E1%84%8B%E1%85%B5%E1%86%B7%20%E1%84%83%E1%85%B3%E1%86%BC%E1%84%85%E1%85%A9%E1%86%A8%E1%84%92%E1%85%A1%E1%84%80%E1%85%B5%20step-by-step%20%E1%84%87%E1%85%A1%E1%86%BC%E1%84%89%E1%85%B5%E1%86%A8.gif" width="200" alt="모임 등록하기 step-by-step"> |
| **모임 이미지저장** | 모임 대표 이미지 업로드 | <img src="https://lengthy-silver-7okhndbu6c.edgeone.app/13%E1%84%86%E1%85%A9%E1%84%8B%E1%85%B5%E1%86%B7%20%E1%84%8B%E1%85%B5%E1%86%B7%E1%84%89%E1%85%B5%E1%84%8C%E1%85%A5%E1%84%8C%E1%85%A1%E1%86%BC.gif" width="200" alt="모임 이미지저장"> |

### 📅 예약 및 참여

| 기능 | 설명 | 이미지 |
|------|------|--------|
| **모임 예약 취소하기** | 예약한 모임 취소 | <img src="https://lengthy-silver-7okhndbu6c.edgeone.app/14%E1%84%86%E1%85%A9%E1%84%8B%E1%85%B5%E1%86%B7%20%E1%84%8B%E1%85%A8%E1%84%8B%E1%85%A3%E1%86%A8%20%E1%84%8E%E1%85%B1%E1%84%89%E1%85%A9%E1%84%92%E1%85%A1%E1%84%80%E1%85%B5.gif" width="200" alt="모임 예약 취소하기"> |
| **모임 예약하기** | 요리 모임에 참여 예약 | <img src="https://lengthy-silver-7okhndbu6c.edgeone.app/15%E1%84%86%E1%85%A9%E1%84%8B%E1%85%B5%E1%86%B7%20%E1%84%8B%E1%85%A8%E1%84%8B%E1%85%A3%E1%86%A8%E1%84%92%E1%85%A1%E1%84%80%E1%85%B5.gif" width="200" alt="모임 예약하기"> |
| **모임 상세 페이지** | 모임의 자세한 정보 확인 | <img src="https://lengthy-silver-7okhndbu6c.edgeone.app/16%E1%84%86%E1%85%A9%E1%84%8B%E1%85%B5%E1%86%B7%20%E1%84%89%E1%85%A1%E1%86%BC%E1%84%89%E1%85%A6%20%E1%84%91%E1%85%A6%E1%84%8B%E1%85%B5%E1%84%8C%E1%85%B5.gif" width="200" alt="모임 상세 페이지"> |

### 💬 댓글 시스템

| 기능 | 설명 | 이미지 |
|------|------|--------|
| **댓글 등록하기** | 모임에 댓글 작성 | <img src="https://lengthy-silver-7okhndbu6c.edgeone.app/17%E1%84%83%E1%85%A2%E1%86%BA%E1%84%80%E1%85%B3%E1%86%AF%20%E1%84%83%E1%85%B3%E1%86%BC%E1%84%85%E1%85%A9%E1%86%A8%E1%84%92%E1%85%A1%E1%84%80%E1%85%B5.gif" width="200" alt="댓글 등록하기"> |
| **댓글 삭제하기** | 작성한 댓글 삭제 | <img src="https://lengthy-silver-7okhndbu6c.edgeone.app/18%E1%84%83%E1%85%A2%E1%86%BA%E1%84%80%E1%85%B3%E1%86%AF%20%E1%84%89%E1%85%A1%E1%86%A8%E1%84%8C%E1%85%A6%E1%84%92%E1%85%A1%E1%84%80%E1%85%B5.gif" width="200" alt="댓글 삭제하기"> |
| **댓글 수정하기** | 작성한 댓글 수정 | <img src="https://lengthy-silver-7okhndbu6c.edgeone.app/19%E1%84%83%E1%85%A2%E1%86%BA%E1%84%80%E1%85%B3%E1%86%AF%20%E1%84%89%E1%85%AE%E1%84%8C%E1%85%A5%E1%86%BC%E1%84%92%E1%85%A1%E1%84%80%E1%85%B5.gif" width="200" alt="댓글 수정하기"> |

### 👤 사용자 프로필

| 기능 | 설명 | 이미지 |
|------|------|--------|
| **마이페이지 내정보수정** | 프로필 정보 수정 | <img src="https://lengthy-silver-7okhndbu6c.edgeone.app/20%E1%84%86%E1%85%A1%E1%84%8B%E1%85%B5%E1%84%91%E1%85%A6%E1%84%8B%E1%85%B5%E1%84%8C%E1%85%B5%20%E1%84%82%E1%85%A2%E1%84%8C%E1%85%A5%E1%86%BC%E1%84%87%E1%85%A9%E1%84%89%E1%85%AE%E1%84%8C%E1%85%A5%E1%86%BC.gif" width="200" alt="마이페이지 내정보수정"> |
| **다른유저 마이페이지** | 다른 사용자 프로필 조회 | <img src="https://lengthy-silver-7okhndbu6c.edgeone.app/21%E1%84%83%E1%85%A1%E1%84%85%E1%85%B3%E1%86%AB%E1%84%8B%E1%85%B2%E1%84%8C%E1%85%A5%20%E1%84%86%E1%85%A1%E1%84%8B%E1%85%B5%E1%84%91%E1%85%A6%E1%84%8B%E1%85%B5%E1%84%8C%E1%85%B5.gif" width="200" alt="다른유저 마이페이지"> |
| **찜한 모임 페이지** | 찜한 모임 목록 조회 | <img src="https://lengthy-silver-7okhndbu6c.edgeone.app/22%E1%84%8D%E1%85%B5%E1%86%B7%E1%84%92%E1%85%A1%E1%86%AB%20%E1%84%86%E1%85%A9%E1%84%8B%E1%85%B5%E1%86%B7%20%E1%84%91%E1%85%A6%E1%84%8B%E1%85%B5%E1%84%8C%E1%85%B5.gif" width="200" alt="찜한 모임 페이지"> |
| **예약한 모임 페이지** | 예약한 모임 목록 조회 | <img src="https://lengthy-silver-7okhndbu6c.edgeone.app/23%E1%84%8B%E1%85%A8%E1%84%8B%E1%85%A3%E1%86%A8%E1%84%92%E1%85%A1%E1%86%AB%20%E1%84%86%E1%85%A9%E1%84%8B%E1%85%B5%E1%86%B7%20%E1%84%91%E1%85%A6%E1%84%8B%E1%85%B5%E1%84%8C%E1%85%B5.gif" width="200" alt="예약한 모임 페이지"> |

### 🏷️ 카테고리 및 탐색

| 기능 | 설명 | 이미지 |
|------|------|--------|
| **카테고리 페이지** | 카테고리별 모임 조회 | <img src="https://lengthy-silver-7okhndbu6c.edgeone.app/24%E1%84%8F%E1%85%A1%E1%84%90%E1%85%A6%E1%84%80%E1%85%A9%E1%84%85%E1%85%B5%20%E1%84%91%E1%85%A6%E1%84%8B%E1%85%B5%E1%84%8C%E1%85%B5.gif" width="200" alt="카테고리 페이지"> |
| **작성한 모임 페이지** | 내가 작성한 모임 목록 | <img src="https://lengthy-silver-7okhndbu6c.edgeone.app/25%E1%84%8C%E1%85%A1%E1%86%A8%E1%84%89%E1%85%A5%E1%86%BC%E1%84%92%E1%85%A1%E1%86%AB%20%E1%84%86%E1%85%A9%E1%84%8B%E1%85%B5%E1%86%B7%20%E1%84%91%E1%85%A6%E1%84%8B%E1%85%B5%E1%84%8C%E1%85%B5.gif" width="200" alt="작성한 모임 페이지"> |

### 🎨 UI/UX 기능

| 기능 | 설명 | 이미지 |
|------|------|--------|
| **다크모드** | 다크/라이트 테마 전환 | <img src="https://lengthy-silver-7okhndbu6c.edgeone.app/26%E1%84%83%E1%85%A1%E1%84%8F%E1%85%B3%E1%84%86%E1%85%A9%E1%84%83%E1%85%B3.gif" width="200" alt="다크모드"> |
| **메인 반응형** | 다양한 화면 크기 대응 | <img src="https://lengthy-silver-7okhndbu6c.edgeone.app/27%E1%84%86%E1%85%A6%E1%84%8B%E1%85%B5%E1%86%AB%20%E1%84%87%E1%85%A1%E1%86%AB%E1%84%8B%E1%85%B3%E1%86%BC%E1%84%92%E1%85%A7%E1%86%BC.gif" width="200" alt="메인 반응형"> |

---

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── Actions/         # 액션 관련 컴포넌트
│   ├── Badges/          # 배지 컴포넌트
│   ├── Banner/          # 배너 컴포넌트
│   ├── Comments/        # 댓글 관련 컴포넌트
│   ├── Info/            # 정보 표시 컴포넌트
│   ├── PostCard/        # 포스트 카드 컴포넌트
│   └── ...
├── contexts/            # React Context
├── hooks/               # Custom Hooks
├── lib/                 # 유틸리티 함수
├── pages/               # 페이지 컴포넌트
└── styles/              # 스타일 파일
```

---

**요리조리**와 함께 맛있는 요리 모임을 만들어보세요! 🍳✨