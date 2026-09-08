# 맥 미니 배포 순서

집이나 사무실 맥 미니에 Docker로 GongSpec을 올리는 순서입니다. Java·Node·MySQL을 맥에 직접 깔 필요는 없습니다.

같은 네트워크에서 `http://맥미니-IP:13001` 로 접속하는 구성을 기준으로 합니다. HTTPS 도메인이 있으면 맨 아래를 참고합니다.

## 0. 미리 준비

- 맥 미니에 **Docker Desktop**과 **Git**
- GitHub에서 이 저장소를 받을 권한
- 카카오 디벨로퍼스 REST API 키 (`CLIENT_ID`, `CLIENT_SECRET`)
- 맥 미니 LAN IP (예: `192.168.0.20`)

IP는 맥 미니 터미널에서 확인합니다.

```bash
ipconfig getifaddr en0
```

Wi-Fi면 `en0` 대신 `en1`일 수 있습니다. 아래 예시의 `192.168.0.20`을 실제 IP로 바꿉니다.

## 1. 맥 미니가 잠들지 않게

시스템 설정 → 에너지(또는 배터리)에서 **디스플레이가 꺼져 있을 때 자동으로 잠자기**를 끕니다. Docker Desktop은 로그인 항목에 넣어 재부팅 후에도 켜지게 합니다.

## 2. Docker Desktop 설치

1. [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)을 설치합니다. Apple Silicon이면 Apple Chip용을 고릅니다.
2. Docker Desktop을 한 번 실행하고, 메뉴 막대 고래 아이콘이 안정될 때까지 기다립니다.
3. 터미널에서 확인합니다.

```bash
docker version
docker compose version
```

## 3. 저장소 받기

```bash
mkdir -p ~/Project
cd ~/Project
git clone https://github.com/kimhj02/gongspec.git
cd gongspec
git checkout feat/calendar-schedule-ui
```

이미 받아 둔 뒤에는 `git pull`만 하면 됩니다.

## 4. 환경 변수

```bash
cp .env.example .env
```

`.env`를 맥 미니 IP에 맞게 고칩니다. `.env`는 커밋하지 않습니다.

```
KAKAO_CLIENT_ID=카카오_REST_키
KAKAO_CLIENT_SECRET=카카오_시크릿
KAKAO_REDIRECT_URI=http://192.168.0.20:13001/auth/kakao/callback

MYSQL_USER=gongspec
MYSQL_PASSWORD=강한_DB_비밀번호
MYSQL_ROOT_PASSWORD=강한_루트_비밀번호

JWT_SECRET=32자_이상_랜덤_문자열
JWT_EXPIRE=7d
CORS_ORIGINS=http://192.168.0.20:13001
COOKIE_SECURE=false
```

`JWT_SECRET`은 로컬 기본값을 그대로 쓰지 않습니다. HTTP(IP 접속)면 `COOKIE_SECURE`는 `false`입니다.

비밀번호와 시크릿은 아래처럼 만들 수 있습니다.

```bash
openssl rand -hex 32
```

## 5. 카카오 Redirect URI

[카카오 디벨로퍼스](https://developers.kakao.com/) → 앱 → 카카오 로그인 → Redirect URI에 `.env`의 `KAKAO_REDIRECT_URI`를 **한 글자도 틀리지 않고** 넣습니다.

예: `http://192.168.0.20:13001/auth/kakao/callback`

카카오가 IP 주소를 거절하면 맥 미니에서 `http://localhost:13001`로 접속하고, Redirect URI와 `CORS_ORIGINS`도 localhost로 맞춥니다. 또는 공유기/hosts에 도메인을 붙입니다.

## 6. 방화벽·포트

같은 집·사무실 Wi-Fi에서만 쓸 때입니다.

- 맥 미니 방화벽이 켜져 있으면 **13001**, **8080**을 허용합니다.
- 공유기 포트 포워딩은 인터넷에 직접 열 때만 필요합니다. 지금은 하지 않는 편이 안전합니다.
- MySQL(3306)은 Docker 안에서만 열리므로 맥 방화벽에 넣지 않아도 됩니다.

## 7. 컨테이너 올리기

저장소 루트에서 실행합니다. 첫 빌드는 수 분 걸립니다.

```bash
cd ~/Project/gongspec
docker compose up --build -d
```

상태 확인:

```bash
docker compose ps
curl -s http://127.0.0.1:8080/api/health
```

`{"status":"ok"}`가 나오면 백엔드는 준비된 것입니다. 프론트는 브라우저에서 `http://192.168.0.20:13001` 을 엽니다.

로그가 필요하면:

```bash
docker compose logs -f --tail=100
```

특정 서비스만 보려면 `backend`, `frontend`, `mysql`을 뒤에 붙입니다.

## 8. 재부팅 후에도 유지

1. Docker Desktop → Settings → General에서 **Start Docker Desktop when you sign in**을 켭니다.
2. 맥 미니에 자동 로그인하거나, 재부팅 후 한 번 로그인합니다.
3. 컨테이너는 보통 다시 뜹니다. 안 떠 있으면 저장소 루트에서 한 번 더 올립니다.

```bash
cd ~/Project/gongspec
docker compose up -d
```

## 9. 코드 갱신

맥 미니에서 다시 받을 때입니다. `.env`와 MySQL 볼륨은 그대로 둡니다.

```bash
cd ~/Project/gongspec
git pull
docker compose up --build -d
```

DB만 지우고 처음부터 올리려면 아래를 실행합니다. **자료가 모두 삭제됩니다.**

```bash
docker compose down -v
docker compose up --build -d
```

## 10. 중지

```bash
cd ~/Project/gongspec
docker compose down
```

`-v`를 빼면 MySQL 데이터는 남습니다.

## 접속 주소

| 어디서 | 주소 |
|---|---|
| 맥 미니 자체 | http://localhost:13001 |
| 같은 네트워크의 다른 기기 | http://192.168.0.20:13001 |
| 백엔드 직접 | http://192.168.0.20:8080/api/health |

프론트 `/api`는 컨테이너 안에서 백엔드로 전달됩니다. 브라우저에서 백엔드 8080을 직접 호출하지 않아도 됩니다.

## HTTPS 도메인을 쓸 때

공인 도메인과 인증서가 있으면 `.env`를 이렇게 바꿉니다.

```
KAKAO_REDIRECT_URI=https://도메인/auth/kakao/callback
CORS_ORIGINS=https://도메인
COOKIE_SECURE=true
```

카카오 Redirect URI도 같은 HTTPS 주소로 다시 등록합니다. 리버스 프록시(Caddy, nginx 등)는 이 문서 범위 밖입니다.

## 자주 막히는 곳

- **로그인 실패:** Redirect URI가 카카오 콘솔, `.env`, 브라우저 주소창과 다릅니다. IP가 바뀌면 세 곳을 같이 고칩니다.
- **페이지는 뜨는데 API만 실패:** `CORS_ORIGINS`에 지금 접속 중인 origin이 없습니다. `http`/`https`, 포트까지 맞춥니다.
- **백엔드가 unhealthy:** `docker compose logs backend`로 MySQL 연결을 봅니다. `.env`의 DB 비밀번호를 바꾼 뒤에는 볼륨을 지우지 않는 한 예전 비밀번호가 남아 있을 수 있습니다.
- **포트 충돌:** 맥 미니에서 13001, 8080을 쓰는 다른 프로그램이 있으면 끄거나 `docker-compose.yml`의 왼쪽 포트를 바꿉니다.
