# GongSpec

공기업 취업 준비용 스펙·일정 정리 사이트입니다. 자격증, 교육, 경력, 지원 현황, 자기소개서를 한곳에서 관리하고 캘린더로 일정을 봅니다.

프론트는 Next.js, 백엔드는 Spring Boot입니다. 카카오 로그인 후 본인 자료만 저장합니다.

## 구성

| | 주소 | 설명 |
|---|---|---|
| 프론트 | http://localhost:13001 | Next.js |
| 백엔드 | http://localhost:8080 | Spring Boot |
| 로컬 DB | H2 파일 (`backend/data/gongspec`) | `SPRING_PROFILES_ACTIVE=local` |
| 배포/MySQL | `localhost:3306/gongspec` | 프로필 없이 기동할 때 |

카카오 Redirect URI는 `http://localhost:13001/auth/kakao/callback`과 디벨로퍼스 앱 설정이 같아야 합니다.

## 준비

- Java 21
- Node.js (프론트)
- 카카오 디벨로퍼스 REST 키

프로젝트 루트에 `.env.example`을 복사해 `.env`를 만듭니다. `.env`는 커밋하지 않습니다.

```bash
cp .env.example .env
```

```
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
KAKAO_REDIRECT_URI=http://localhost:13001/auth/kakao/callback
```

백엔드는 실행 시 루트 `.env`를 읽습니다. Maven은 `backend/.tools/apache-maven-3.9.11`을 쓰거나, 설치한 `mvn`을 쓰면 됩니다.

## 로컬 실행

터미널 두 개에서 백엔드를 먼저 켠 뒤 프론트를 켭니다.

**1. 백엔드 (H2)**

```bash
cd backend
export JAVA_HOME="/path/to/jdk-21"
export SPRING_PROFILES_ACTIVE=local
./.tools/apache-maven-3.9.11/bin/mvn spring-boot:run
```

**2. 프론트**

```bash
cd frontend
API_BASE_URL=http://127.0.0.1:8080 npm run dev -- -p 13001
```

브라우저에서 http://localhost:13001 로 접속합니다.

`SPRING_PROFILES_ACTIVE=local`을 빼면 MySQL(`gongspec` / `gongspec`)에 붙습니다. MySQL만 띄울 때는 `backend/docker-compose.yml`을 씁니다.

```bash
cd backend
docker compose up -d
```

## Docker 배포

루트 `docker-compose.yml`로 프론트, 백엔드, MySQL을 한 번에 띄웁니다. 루트 `.env`에 카카오 키를 넣고, 카카오 Redirect URI는 브라우저가 여는 프론트 주소와 같아야 합니다.

```bash
cp .env.example .env
docker compose up --build
```

| 서비스 | 주소 |
|---|---|
| 프론트 | http://localhost:13001 |
| 백엔드 | http://localhost:8080 |
| MySQL | compose 네트워크 안 (`mysql:3306`) |

공개 배포면 `.env`에서 `KAKAO_REDIRECT_URI`, `CORS_ORIGINS`를 실제 프론트 URL로 바꾸고 `COOKIE_SECURE=true`로 둡니다. `JWT_SECRET`도 로컬 기본값을 쓰지 않습니다.

맥 미니에 올리는 순서는 [docs/mac-mini-deploy.md](docs/mac-mini-deploy.md)를 따릅니다.

## 기능

- 카카오 로그인 (HttpOnly 쿠키)
- 캘린더 일정 추가·수정, 공휴일·지원 전형 날짜 표시
- 자격증, 학교교육, 직업교육, 경력, 프로젝트, 지원 현황, 자기소개서, 메모, 사이트
- 지원 현황은 회사명과 공고명을 따로 두고, 자기소개서는 공고명을 따름

## 테스트

```bash
cd backend && ./.tools/apache-maven-3.9.11/bin/mvn test
cd frontend && npm test
```
