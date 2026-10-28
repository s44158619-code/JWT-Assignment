# JWT 게시판 기능 테스트 결과

## 1. 테스트 환경

| 항목            | 내용                                                    |
| --------------- | ------------------------------------------------------- |
| 프론트엔드      | React                                                   |
| 백엔드          | Python FastAPI                                          |
| 데이터베이스    | SQLite                                                  |
| 인증 방식       | JWT (HS256)                                             |
| 테스트 계정     | Alice (ID 1), Bob (ID 2)                                |
| 프론트엔드 주소 | http://127.0.0.1:4173                                   |
| 백엔드 주소     | http://127.0.0.1:8000                                   |
| 테스트 방법     | 브라우저 개발자 도구 Network, PowerShell, 자동 API 검사 |
| 토큰 유효 시간  | 기본 90초, 만료 검사 시 3초                             |

## 2. 기능별 테스트 결과

| ID  | 요청 및 테스트 조건                                  | 예상 결과                    | 실제 확인 사항                                      | 증거 파일                                        |
| --- | ---------------------------------------------------- | ---------------------------- | --------------------------------------------------- | ------------------------------------------------ |
| T01 | GET /api/posts 및 /api/posts/{id}, 토큰 없음         | 200                          | 공개 목록·상세 조회 완료 보고                       | 03_create.png                                    |
| T02 | POST /api/auth/login, Alice 정상 계정                | 200                          | JWT 발급 및 Alice 로그인 표시 완료 보고             | 02_login.png                                     |
| T03 | POST /api/auth/login, 잘못된 비밀번호 및 없는 이메일 | 401 INVALID_CREDENTIALS      | 최종 캡처 확인 필요                                 | 15_T03_invalid_login.png                         |
| T04 | GET /api/me, POST /api/posts, 토큰 없음              | 401 TOKEN_REQUIRED           | /me 무토큰 거부 확인 보고, 등록 거부 결과 확인 필요 | 06_no_token.png, 16_T04_no_token_create.png      |
| T05 | POST /api/posts, GET /api/me, Alice 토큰             | 201, 200                     | Alice 글 작성 및 사용자 정보 조회 완료 보고         | 03_create.png                                    |
| T06 | PUT 및 DELETE /api/posts/{id}, Alice 본인 글         | 200, 204                     | 본인 글 수정·삭제 완료 보고                         | 09_delete.png                                    |
| T07 | PUT /api/posts/{id}, Bob이 Alice 글 수정             | 403 FORBIDDEN                | 수정 차단 및 원본 유지 완료 보고                    | 04_permission.png                                |
| T08 | DELETE /api/posts/{id}, Bob이 Alice 글 삭제          | 403 FORBIDDEN                | 최종 캡처 확인 필요                                 | 17_T08_forbidden_delete.png                      |
| T09 | GET /api/me 및 POST·PUT·DELETE, 변조 JWT             | 401 INVALID_TOKEN            | /me 변조 거부 확인 보고, 변경 API 결과 확인 필요    | 07_invalid_token.png, 18_T09_tampered_write.png  |
| T10 | 만료 JWT로 /me 및 글 등록·수정·삭제                  | 401 TOKEN_EXPIRED            | 만료 차단, 원본 유지, UI 로그아웃 완료 보고         | 24_T10_expired_write.png, 25_T10_expired_ui.png  |
| T11 | 로그인 후 로그아웃 및 무토큰 /me                     | 401 TOKEN_REQUIRED           | 로그아웃과 토큰 없는 요청 거부 완료 보고            | 26_T11_logout_network.png, 26_T11_logout_api.png |
| T12 | Bob이 authorId:1, userId:1 추가하여 글 작성          | 400 BAD_INPUT                | 최종 캡처 확인 필요                                 | 19_T12_author_spoof.png                          |
| T13 | 공백 제목·본문, 길이 초과                            | 400 BAD_INPUT                | 공백 제목 확인 보고, 나머지 결과 확인 필요          | 10_bad_input.png, 20_T13_validation.png          |
| T14 | 없는 글 GET·PUT·DELETE, 잘못된 ID GET                | 404 NOT_FOUND, 400 BAD_INPUT | 네 가지 요청 완료 보고                              | 21_T14_not_found.png                             |
| T15 | 글 작성 후 백엔드 서버 종료·재실행                   | 데이터 유지                  | 게시글·작성자·내용 유지 완료 보고                   | 11_persistence_before.png, 11_persistence.png    |
| T16 | 로그인 후 페이지 새로고침                            | 공개 글 유지, 로그인 해제    | 정상 동작 완료 보고                                 | 12_logout.png (추가 캡처 권장)                   |
| T17 | 무토큰 수정·삭제, Bob 본인 CRUD                      | 401 및 201·200·204           | 무토큰 차단과 Bob CRUD 완료 보고                    | 22_T17_no_token_edit.png, 23_T17_bob_crud.png    |

## 3. 자동 검사 및 추가 검증

- 최종 API 자동 검사: `python tools/check_api.py --mode final`
- JWT 만료 자동 검사: `python tools/check_api.py --mode final --expiry`
- React 빌드: `npm run build`
- React 실행: `npm run preview`
- SQLite 유지: 백엔드를 실제 종료하고 재시작한 후 공개 조회로 확인

자동 검사와 만료 검사, React 빌드, SQLite 유지 테스트는 진행 과정에서 완료한 것으로 보고하였다. 최종 보고서에는 저장된 실제 출력 결과와 일치하는 통과 건수 및 메시지만 기록한다.

## 4. 결과 분석

JWT 인증에서는 로그인한 사용자에게 토큰을 발급하고, 보호된 API 요청에서 토큰의 서명과 만료 여부 및 필수 클레임을 검증하도록 구현하였다. 검증된 사용자 ID를 후속 게시글 처리에 전달하는 과정을 **요청 주체 연결점**으로 설명할 수 있다.

게시글의 수정·삭제에서는 검증된 사용자 ID와 데이터베이스에 저장된 작성자 ID를 비교하여 본인 여부를 판단한다. 이 비교 과정은 **권한 경계 대조**에 해당하며, 다른 사용자에게는 403 FORBIDDEN을 반환한다.

토큰이 없는 경우, 토큰이 변조된 경우, 토큰이 만료된 경우를 구분하여 401 응답을 반환하도록 구현하였다. 또한 SQLite 파일을 사용하여 서버 재시작 후에도 게시글이 유지되도록 구성하였다.

본 문서는 테스트 진행 기록을 바탕으로 작성한 초안이며, 제출 전 각 증거 파일의 HTTP 상태·JSON code·데이터 유지 결과를 대조하여 실제 수행 결과로 확정한다.
