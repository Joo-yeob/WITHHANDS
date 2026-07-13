# WITHHANDS

사진을 찍으면 AI가 판타지 생물로 변환해주는 도감 수집 앱입니다.

## 기술 스택

- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Database & Auth**: Supabase
- **Storage**: Supabase Storage
- **AI**: Google Gemini 2.5 Flash (`@google/genai` SDK)
- **Animations**: Framer Motion

## 주요 기능

- 📸 **캡처**: 사진을 찍거나 업로드하면 AI가 판타지 생물로 변환
- 📖 **도감**: 수집한 생물을 한눈에 보기
- 🔍 **검색**: 이름, 타입, 레어도로 생물 검색
- 👤 **프로필**: 닉네임, 상태메시지, 프로필 이미지 관리
- 👥 **친구**: 친구 코드로 친구 추가 및 도감 공유

## 시작하기

### 1. 사전 준비

- Node.js 18 이상
- [Supabase](https://supabase.com) 프로젝트
- [Google AI Studio](https://aistudio.google.com)에서 Gemini API 키 발급

### 2. 설치

```bash
git clone <repo-url>
cd handsdex
npm install
```

### 3. 환경 변수 설정

`src/.env` 파일을 생성하고 아래 값을 채워주세요:

```bash
# Supabase
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google Gemini
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### 4. Supabase 설정

#### 데이터베이스 스키마

`supabase_schema.sql` 파일을 Supabase SQL Editor에서 실행하세요:

```bash
# Supabase Dashboard → SQL Editor → supabase_schema.sql 내용 실행
```

#### Storage 버킷

Supabase Dashboard → Storage에서 `uploads`라는 **public** 버킷을 생성하세요.

파일은 자동으로 다음 폴더에 저장됩니다:
- `uploads/profile/` — 프로필 이미지
- `uploads/creatures/` — 캡처한 생물 이미지

### 5. 실행

```bash
npm run dev
```

Vite가 출력하는 로컬 URL을 브라우저에서 열면 됩니다.

## 프로젝트 구조

```
src/
├── api/                  # Supabase 클라이언트 및 DB 래퍼
│   ├── supabaseClient.js
│   ├── dbClient.js
│   └── base44Client.js   # 인터페이스 호환용
├── components/
│   ├── capture/          # 캡처 관련 컴포넌트
│   ├── creatures/        # 생물 카드 컴포넌트
│   ├── layout/           # 레이아웃
│   ├── profile/          # 프로필 모달
│   └── ui/               # shadcn/ui 컴포넌트
├── pages/                # 라우트 페이지
├── services/
│   ├── aiService.js      # Gemini 2.5 Flash 연동
│   └── storageService.js # Supabase Storage 연동
├── lib/                  # 유틸리티, 인증 컨텍스트
└── App.jsx               # 라우터
```