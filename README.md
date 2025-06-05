# 요리조리 (YoriJori)

> **요리 클래스를 모집하고 참여할 수 있는 플랫폼**입니다.  
> 회원가입부터 모임 작성, 예약, 댓글, 마이페이지까지 전 기능이 구현되어 있으며,  
> `PocketBase`, `React`, `TailwindCSS`, `Storybook`, `Vite` 등 최신 프론트엔드 기술을 활용했습니다.

---

## ✨ 주요 기능

### ✅ 사용자 기능 (Auth + User)

- [ ] 회원가입 / 로그인 / 로그아웃 / 회원탈퇴  
  - localStorage로 로그인 상태 유지
  - 로그인 상태 기반 기능 접근 제어
- [ ] 프로필 등록 및 수정 (닉네임, 프로필)
- [ ] 유효성 검사 및 중복 검사
  - 닉네임 5글자 이내
  - 이메일 형식 검증
  - 비밀번호: 대문자 + 특수문자 포함, 8~16자
  - 동일 이메일/닉네임 중복 검사
- [ ] 회원가입 완료 시 마이페이지 이동
- [ ] 회원탈퇴 시 관련 모임, 댓글 자동 제거

---

### ✅ 모임 기능 (Posts)

- [ ] 무한스크롤 방식의 모임 리스트 조회
- [ ] 최신순 / 인기순 필터링
- [ ] 키워드 검색 기능
- [ ] Step-by-step 방식의 모임 작성
  - 단계별 유효성 검사 포함
  - 임시저장 가능
- [ ] 모임 수정 / 삭제 기능
- [ ] 이미지 확대 보기 (모달)
- [ ] 모임 찜하기 (하트 버튼) 기능
- [ ] 모임 상세 페이지 진입 시 로그인 검증

---

### ✅ 예약 기능 (Reservation)

- [ ] 모임 예약 신청 (중복 방지 및 버튼 비활성화)
- [ ] 예약자 수 및 인원 제한 표시
- [ ] 마감 임박 안내 뱃지 (D-3 이내 또는 인원 1/3 이하일 경우)
- [ ] 예약자 목록 (아바타, 닉네임, 인원 수)
- [ ] 마이페이지에서 예약 취소
- [ ] 모집 상태 표시 (모집중 / 마감 / 임박)
- [ ] 로그인 사용자만 예약 가능

---

### ✅ 댓글 기능 (Comments)

- [ ] 로그인 사용자 댓글 작성
  - 프로필 이미지, 닉네임, 작성일 포함
- [ ] 댓글 실시간 렌더링
- [ ] 댓글 수정 및 삭제
- [ ] 최신순 정렬
- [ ] 총 댓글 수 표시

---

### ✅ 마이페이지 (MyPage)

- [ ] 내 정보 (프로필, 닉네임) 확인 및 수정
- [ ] 탭 분리 UI 구성
  - 내가 작성한 모임
  - 예약한 모임
  - 찜한 모임
- [ ] 각 탭에서 실시간 데이터 렌더링
  - 작성글: 수정 및 삭제
  - 예약글: 취소 가능
  - 찜글: 하트 버튼으로 취소
- [ ] 회원가입 후 메인으로 이동
- [ ] 다른 유저의 마이페이지 접근 가능
- [ ] 접근 권한 검증 (비로그인 시 리다이렉트)

---

## 🧩 기타 공통 기능

- [ ] 다크모드 지원 (Tailwind 기반)
- [ ] 맨 위로 가기 버튼
- [ ] Skeleton UI (1초 이상 로딩 시 노출)
- [ ] SEO 최적화를 위한 메타태그 (`react-helmet`)
- [ ] Lazy Loading 적용 (`React.lazy` + `Suspense`)
- [ ] 환경변수로 PocketBase URL 관리 (`VITE_PB_URL`)
- [ ] PocketBase 인증 / 파일 업로드 / 관계형 참조 적극 활용

---

## 🛠️ 기술 스택

- **Frontend**: React, JavaScript, Tailwind CSS, Vite
- **Backend (BaaS)**: PocketBase, PocketHost
- **State Management**: Context API + LocalStorage
- **Component Library**: Storybook (UI 개발 및 문서화)
- **Build Tools**: PostCSS, vite-plugin-compression

---

## 📁 디렉토리 구조 (예시)
```
yorijori-project/

├── public/               # 정적 파일
├── src/                  # 소스 코드
│   ├── components/       # 재사용 가능한 UI 컴포넌트
│   ├── pages/            # 라우팅되는 페이지 컴포넌트
│   ├── features/         # 주요 도메인별 비즈니스 로직
│   ├── hooks/            # 커스텀 훅 모음
│   ├── utils/            # 유틸리티 함수
│   └── styles/           # Tailwind 및 공통 스타일
├── pocketbase/           # PocketBase 관련 설정
├── postcss.config.js     # PostCSS 설정
├── vite.config.js        # Vite 번들러 설정
└── README.md             # 프로젝트 문서
```