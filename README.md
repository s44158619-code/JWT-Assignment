# 우리의 학습 기록 — JWT 인증 게시판

웹서비스설계 개인 과제로 제작한 JWT 인증 기반 학습 기록 공유 웹서비스입니다.

React와 FastAPI를 사용하여 게시판을 구현했으며, SQLite 파일 데이터베이스에 게시글을 저장합니다.

비로그인 사용자도 게시글을 자유롭게 조회할 수 있지만, 게시글 작성은 로그인한 사용자만 가능합니다. 게시글의 수정과 삭제는 작성자 본인에게만 허용됩니다.

## 1. 작성자 및 서비스 소개

- 학번: [202212953]
- 이름: [성윤오]
- 과목: 웹서비스설계
- 과제명: JWT 인증을 적용한 나만의 게시판 만들기
- 서비스명: 우리의 학습 기록

### 서비스 목적

프로그래밍, 알고리즘, 웹 개발 등 학습한 내용을 기록하고 공유하기 위한 게시판입니다.

사용자는 다른 사람의 학습 기록을 자유롭게 열람할 수 있으며, 로그인 후 자신의 학습 내용을 등록할 수 있습니다.

JWT 인증을 통해 로그인 사용자를 확인하고, 게시글 작성자와 현재 사용자를 비교하여 수정 및 삭제 권한을 제어합니다.

### 주요 기능

1. 비로그인 사용자 게시글 목록 및 상세 조회
2. Alice와 Bob 테스트 계정을 이용한 로그인
3. 로그인 성공 시 JWT Access Token 발급
4. JWT를 이용한 사용자 인증 및 내 정보 조회
5. 로그인 사용자의 게시글 등록
6. 작성자 본인의 게시글 수정 및 삭제
7. 타인 게시글 수정 및 삭제 차단
8. JWT 변조 및 만료 검증
9. 입력값 검증과 HTTP 오류 처리
10. 로그아웃 및 로그인 상태 초기화
11. SQLite를 이용한 게시글 데이터 유지

회원가입, 소셜 로그인, Refresh Token, 이미지 업로드 및 외부 서버 배포는 이번 과제의 필수 구현 범위에 포함하지 않았습니다.

## 2. 기술 스택

| 구분                 | 사용 기술              |
| -------------------- | ---------------------- |
| 프론트엔드           | React 19.3.0           |
| 프론트엔드 빌드 도구 | Vite 8.3.4             |
| 백엔드               | Python FastAPI 0.143.0 |
| ASGI 서버            | Uvicorn 0.54.0         |
| JWT 라이브러리       | PyJWT 2.15.1           |
| 환경변수 관리        | python-dotenv 1.2.4    |
| 데이터베이스         | SQLite                 |
| 데이터베이스 접근    | Python sqlite3         |
| 인증 알고리즘        | HS256                  |
| API 통신             | HTTP / JSON            |

### 실행 환경

- 운영체제: Windows
- Node.js: 20.19 이상
- Python: 3.10 이상
- npm: Node.js와 함께 설치
- Git: 저장소 복제 및 버전 관리

실제 테스트에 사용한 버전:

- Node.js: [v24.11.0]
- npm: [11.6.1]
- Python: [Python 3.10.11]
- Git: [git version 2.51.0.windows.1]

프론트엔드 의존성 버전은 package.json을 기준으로 하며, 백엔드 의존성 버전은 requirements.txt를 기준으로 합니다.

## 3. 프로젝트 구조

```text
JWT-Assignment/
├── README.md
├── .gitignore
│
├── frontend-react/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── src/
│       ├── api.js
│       ├── main.jsx
│       └── style.css
│
├── backend-fastapi/
│   ├── .env.example
│   ├── README.md
│   ├── requirements.txt
│   ├── app.py
│   ├── auth.py
│   ├── errors.py
│   ├── store.py
│   └── users.py
│
├── docs/
│   ├── report.pdf
│   ├── test-results.md
│   └── evidence/
│
└── tools/
    └── check_api.py
```

- frontend-react: React 화면과 API 요청 처리
- backend-fastapi: REST API, JWT 인증 및 권한 처리
- docs: 구현 보고서와 테스트 증거
- tools: 교수자 제공 API 자동 검사 도구

SQLite 데이터베이스 파일은 백엔드 실행 시 생성됩니다.

## 4. 설치 및 실행 방법

이 프로젝트는 Windows PowerShell 기준으로 실행합니다.

백엔드와 프론트엔드를 각각 실행해야 하며, 별도 클라우드 서버나 데이터베이스 서버는 필요하지 않습니다.

### 4.1 GitHub 저장소 복제

```powershell
git clone [GitHub 저장소 URL]
cd [저장소 폴더명]
```

GitHub 주소는 저장소 생성 후 실제 URL로 교체해야 합니다.

### 4.2 백엔드 설치

프로젝트 루트에서 다음 명령어를 실행합니다.

```powershell
cd backend-fastapi
```

Python 가상환경을 생성합니다.

```powershell
python -m venv .venv
```

의존성을 설치합니다.

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### 4.3 JWT 환경변수 설정

backend-fastapi 폴더의 `.env.example`을 복사하여 `.env` 파일을 생성합니다.

```powershell
Copy-Item .env.example .env
```

새로운 JWT 비밀 키를 생성합니다.

```powershell
.\.venv\Scripts\python.exe -c "import secrets; print(secrets.token_hex(32))"
```

출력된 64자리 16진수 문자열을 복사하여 `.env` 파일의 JWT_SECRET에 입력합니다.

환경설정 예시는 다음과 같습니다.

```dotenv
JWT_SECRET=여기에_새로_생성한_64자리_16진수_입력
JWT_ISSUER=webservice-class
JWT_AUDIENCE=board-api
TOKEN_TTL=90
DB_FILE=data/board.sqlite
PORT=8000
```

JWT_SECRET은 반드시 직접 생성한 난수로 설정해야 합니다.

실제 JWT_SECRET과 `.env` 파일은 GitHub에 업로드하지 않습니다.

기본 JWT 유효 시간은 90초입니다.

### 4.4 백엔드 실행

backend-fastapi 폴더에서 다음 명령어를 실행합니다.

```powershell
.\.venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8000
```

정상 실행 시 다음 주소에서 상태를 확인할 수 있습니다.

http://127.0.0.1:8000/api/health

정상 응답 예시:

```json
{
  "status": "ok",
  "stack": "fastapi"
}
```

FastAPI API 문서:

http://127.0.0.1:8000/docs

FastAPI 서버는 종료하지 않고 유지합니다.

### 4.5 프론트엔드 설치

VS Code에서 새로운 PowerShell 터미널을 엽니다.

프로젝트 루트에서 실행합니다.

```powershell
cd frontend-react
```

의존성을 설치합니다.

```powershell
npm ci
```

### 4.6 React 빌드

```powershell
npm run build
```

정상적으로 빌드되면 dist 폴더가 생성됩니다.

### 4.7 React 빌드 결과 실행

```powershell
npm run preview
```

브라우저에서 다음 주소로 접속합니다.

http://127.0.0.1:4173

백엔드 서버는 8000번 포트에서 실행 중이어야 합니다.

프론트엔드의 `/api` 요청은 Vite 프록시를 통해 FastAPI 서버로 전달됩니다.

프록시 설정 파일:

`frontend-react/vite.config.js`

API 서버 포트를 변경하려면 해당 파일의 server.proxy와 preview.proxy를 함께 수정해야 합니다.

### 4.8 개발 서버 실행

프론트엔드 개발 중에는 다음 명령어를 사용할 수 있습니다.

```powershell
npm run dev
```

개발 서버 주소:

http://127.0.0.1:5173

개발 서버와 Preview 서버는 별도의 실행 방식입니다.

최종 제출 전에는 npm run build와 npm run preview를 이용해 빌드된 화면을 검증합니다.

### 4.9 서버 종료와 코드 변경

각 서버를 실행한 PowerShell 터미널에서 Ctrl+C를 누르면 서버가 종료됩니다.

프론트엔드 코드를 변경한 경우:

```powershell
npm run build
```

이후 Preview 서버를 다시 실행합니다.

백엔드 코드 또는 환경설정을 변경한 경우에는 백엔드 서버를 재시작합니다.

## 5. 테스트 계정

| 사용자 | 이메일           | 비밀번호       |
| ------ | ---------------- | -------------- |
| Alice  | alice@class.test | Classroom!2026 |
| Bob    | bob@class.test   | Classroom!2026 |

위 계정은 교수님 제공 템플릿의 과제 전용 테스트 계정입니다.

회원가입 기능 없이 제공된 사용자 정보와 비밀번호 검증 함수를 이용합니다.

## 6. SQLite 데이터베이스

데이터베이스 종류: SQLite

기본 파일 경로:

```text
backend-fastapi/data/board.sqlite
```

별도 데이터베이스 서버를 설치할 필요가 없습니다.

게시글 등록·수정·삭제 결과는 SQLite 파일에 반영됩니다.

### 데이터 유지

페이지를 새로고침하거나 백엔드 서버를 종료한 후 동일한 프로젝트 폴더에서 다시 실행해도 게시글 데이터가 유지됩니다.

테스트에서는 서버 재시작 전후 게시글 제목, 내용 및 작성자 정보를 비교했습니다.

### 데이터베이스 초기화

1. FastAPI 서버를 종료합니다.
2. backend-fastapi 폴더로 이동합니다.
3. 다음 명령어를 실행합니다.

```powershell
Remove-Item .\data\board.sqlite
```

4. FastAPI 서버를 다시 실행합니다.

기존 게시글 데이터가 모두 삭제되고 새 SQLite 파일이 생성됩니다.

제출 저장소에는 실제 SQLite 데이터베이스 파일을 포함하지 않습니다.

## 7. 구현 기능 및 핵심 파일

| 기능               | 상태 | 주요 파일                |
| ------------------ | ---- | ------------------------ |
| 게시글 목록 조회   | 완료 | app.py, store.py         |
| 게시글 상세 조회   | 완료 | app.py, store.py         |
| JWT 로그인 및 발급 | 완료 | auth.py, app.py          |
| JWT 검증           | 완료 | auth.py                  |
| 내 정보 조회       | 완료 | app.py, auth.py          |
| 게시글 등록        | 완료 | app.py, store.py         |
| 본인 게시글 수정   | 완료 | auth.py, app.py          |
| 본인 게시글 삭제   | 완료 | auth.py, app.py          |
| 작성자 권한 검사   | 완료 | auth.py                  |
| 로그인 화면 연결   | 완료 | src/api.js, src/main.jsx |
| 오류별 화면 처리   | 완료 | src/api.js, src/main.jsx |
| 로그아웃           | 완료 | src/api.js, src/main.jsx |
| SQLite 데이터 유지 | 완료 | store.py                 |

### 7.1 JWT 로그인 및 발급

`backend-fastapi/auth.py`

주요 함수: `issue_token()`

로그인 시 이메일과 비밀번호를 검증하고 올바른 사용자에게만 JWT를 발급합니다.

JWT는 HS256 알고리즘을 사용하며, sub, exp, iss, aud 클레임을 포함합니다.

비밀번호나 비밀번호 해시는 JWT에 포함하지 않습니다.

### 7.2 프론트엔드 토큰 보관 및 전송

`frontend-react/src/api.js`

주요 함수:

- login()
- authorizationHeaders()
- request()
- clearSession()

로그인 성공 시 accessToken과 user를 브라우저 메모리에 저장합니다.

보호 API 요청에는 Authorization: Bearer 형식으로 JWT를 전송합니다.

localStorage와 sessionStorage에는 JWT를 저장하지 않습니다.

페이지를 새로고침하면 로그인 상태가 해제됩니다.

### 7.3 서버 JWT 검증

`backend-fastapi/auth.py`

주요 함수: `current_user_id()`

보호 API 요청마다 Authorization 헤더를 확인합니다.

JWT 서명, 허용 알고리즘, 만료 시간, 발급자, 사용 대상 및 사용자 ID를 검증합니다.

검증된 사용자 ID만 후속 API 처리에 전달합니다.

이 과정을 요청 주체 연결점으로 설명할 수 있습니다.

### 7.4 작성자 권한 검사

`backend-fastapi/auth.py`

주요 함수: `assert_owner()`

게시글 수정·삭제 시 현재 로그인 사용자 ID와 데이터베이스에 저장된 작성자 ID를 비교합니다.

두 ID가 다르면 403 FORBIDDEN을 반환하여 변경을 거부합니다.

이 과정은 권한 경계 대조에 해당합니다.

프론트엔드에서 수정·삭제 버튼을 숨기는 것과 별개로 서버에서도 권한을 검사합니다.

## 8. REST API

| HTTP   | API             | 설명               |
| ------ | --------------- | ------------------ |
| GET    | /api/health     | 서버 상태 확인     |
| POST   | /api/auth/login | 로그인 및 JWT 발급 |
| GET    | /api/me         | 로그인 사용자 정보 |
| GET    | /api/posts      | 게시글 목록        |
| GET    | /api/posts/{id} | 게시글 상세        |
| POST   | /api/posts      | 게시글 작성        |
| PUT    | /api/posts/{id} | 게시글 수정        |
| DELETE | /api/posts/{id} | 게시글 삭제        |

### HTTP 상태 및 오류 코드

| HTTP | JSON code           | 설명                            |
| ---- | ------------------- | ------------------------------- |
| 400  | BAD_INPUT           | 잘못된 입력                     |
| 401  | INVALID_CREDENTIALS | 잘못된 로그인 정보              |
| 401  | TOKEN_REQUIRED      | 토큰 누락 또는 Bearer 형식 오류 |
| 401  | INVALID_TOKEN       | 유효하지 않은 JWT               |
| 401  | TOKEN_EXPIRED       | JWT 유효 시간 만료              |
| 403  | FORBIDDEN           | 다른 사용자 게시글 변경         |
| 404  | NOT_FOUND           | 게시글이 존재하지 않음          |

정상 게시글 등록은 201 Created를 반환합니다.

정상 게시글 삭제는 204 No Content를 반환합니다.

보호 API의 인증 실패에는 WWW-Authenticate: Bearer 헤더를 사용하며, 게시글 등록에는 Location 헤더를 사용합니다.

## 9. 테스트 방법

### 9.1 자동 API 검사

FastAPI 서버를 실행한 상태에서 프로젝트 루트 폴더에서 다음 명령어를 실행합니다.

```powershell
python tools/check_api.py --mode final
```

Windows 환경에서는 python 대신 py를 사용할 수 있습니다.

자동 검사는 로그인, JWT 검증, 게시글 처리, 작성자 권한 및 오류 응답을 점검합니다.

### 9.2 JWT 만료 검사

먼저 백엔드 서버를 종료합니다.

backend-fastapi 폴더의 PowerShell 터미널에서:

```powershell
$env:TOKEN_TTL="3"
```

이어서 FastAPI 서버를 실행합니다.

```powershell
.\.venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8000
```

새 PowerShell 터미널에서 프로젝트 루트로 이동한 후:

```powershell
python tools/check_api.py --mode final --expiry
```

검사 후에는 서버를 종료하고 다음 명령어로 임시 환경변수를 제거합니다.

```powershell
Remove-Item Env:TOKEN_TTL
```

이후 서버를 재시작해 기본 TTL 90초로 복구합니다.

### 9.3 수동 테스트

교수님 제공 T01~T17 시나리오를 기준으로 다음 항목을 검사했습니다.

- 비로그인 게시글 목록 및 상세 조회
- 올바른 계정 로그인
- 잘못된 계정 로그인 거부
- 토큰 없는 보호 API 접근 거부
- Alice의 게시글 작성 및 본인 수정·삭제
- Bob의 Alice 게시글 수정·삭제 차단
- 변조된 JWT 거부
- 만료된 JWT 거부
- 작성자 정보 위조 방지
- 입력 길이 및 공백 검증
- 존재하지 않는 게시글 처리
- 로그아웃과 새로고침
- 서버 재시작 후 데이터 유지
- Bob 자신의 게시글 CRUD

### 9.4 테스트 결과 및 증거

- [T01~T17 테스트 결과표](docs/test-results.md)
- [테스트 증거 폴더](docs/evidence/)
- [구현 보고서 PDF](docs/report.pdf)

실제 테스트 결과와 HTTP 응답 캡처는 docs/evidence 폴더에 저장합니다.

## 10. AI 활용 및 출처

### AI 활용 여부

AI를 활용했습니다.

사용 도구: OpenAI ChatGPT

사용 목적:

- JWT 인증과 권한 검사 개념 이해
- FastAPI 및 React 코드 작성 보조
- API 요청과 PowerShell 테스트 명령어 작성
- 실행 오류 해결
- 테스트 시나리오 검증 안내
- README 및 보고서 작성 보조

### AI 활용 과정

1. 교수님 제공 템플릿의 구조를 확인하고 JWT 인증 구현 방향을 검토했습니다.
2. ChatGPT의 도움을 받아 auth.py, api.js, main.jsx 코드를 작성·수정했습니다.
3. 실제 VS Code 환경에 코드를 반영하고 서버를 실행했습니다.
4. PowerShell과 브라우저 개발자 도구를 이용해 JWT 발급, 검증, 작성자 권한 및 오류 응답을 확인했습니다.
5. API 자동 검사와 만료 검사, React 빌드 및 SQLite 유지 테스트를 수행했습니다.

AI에서 제공한 코드와 설명은 실제 실행 결과를 통해 검증했으며, 구현 및 테스트 과정은 보고서에 상세히 기록합니다.

### 참고 자료

- 웹서비스설계 수업 제공 시작 템플릿
- 웹서비스설계 과제 공지 및 공통 API 명세
- 교수님 제공 구현 체크리스트와 테스트 시나리오
- FastAPI 공식 문서: https://fastapi.tiangolo.com/
- React 공식 문서: https://react.dev/
- PyJWT 공식 문서: https://pyjwt.readthedocs.io/
- Vite 공식 문서: https://vite.dev/

공식 문서는 구현 내용과 관련된 참고 자료이며, 실제로 열람·활용한 항목과 사용 위치는 보고서에서 구분하여 기록합니다.

## 11. 보고서

- [최종 구현 보고서](docs/report.pdf)
- [테스트 결과 정리](docs/test-results.md)
- [테스트 증거](docs/evidence/)

보고서에는 서비스 목적, 시스템 구조, 핵심 코드 설명, JWT 인증 흐름, 작성자 권한 검사, 테스트 결과, 오류 처리 및 AI 활용 내역을 포함합니다.

## 12. 제출 전 확인

- [ ] 작성자 학번과 이름 입력
- [ ] 실제 Node.js, npm, Python 버전 입력
- [ ] GitHub 저장소 URL 입력
- [ ] 선택하지 않은 프론트·백엔드 템플릿 제외
- [ ] README 실행 절차 확인
- [ ] React 빌드 결과에서 기능 확인
- [ ] 보고서 PDF 추가
- [ ] 테스트 증거 링크 확인
- [ ] 새 폴더에 clone 후 실행 확인
- [ ] .env 및 비밀 키 제외 확인
- [ ] SQLite 데이터베이스 파일 제외 확인
- [ ] node_modules, .venv, dist 제외 확인
- [ ] 최종 GitHub push
- [ ] 저장소 URL 및 커밋 SHA를 LMS에 제출

## 13. 보안 및 유의사항

이 프로젝트는 웹서비스설계 과제용 로컬 실행 서비스입니다.

JWT_SECRET은 환경변수로 설정하고 실제 비밀 키는 GitHub에 업로드하지 않습니다.

JWT는 브라우저 메모리에만 저장하며 새로고침 시 로그인 상태가 초기화됩니다.

SQLite 파일 데이터베이스는 로컬에 유지되지만 제출 저장소에는 포함하지 않습니다.

로그아웃은 현재 브라우저 탭의 인증 상태를 초기화하는 기능이며, 이미 발급된 JWT를 서버에서 즉시 무효화하는 기능은 포함하지 않습니다.

실제 운영 서비스를 위한 회원가입, 사용자 관리, Refresh Token 및 배포 보안 기능은 구현 범위에 포함하지 않았습니다.
