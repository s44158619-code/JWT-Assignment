
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { api, login, getSession, clearSession, canEdit } from "./api";
import "./style.css";

function App() {
  const [posts, setPosts] = useState([]);
  const [selected, setSelected] = useState(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editing, setEditing] = useState(null);

  const [email, setEmail] = useState("alice@class.test");
  const [password, setPassword] = useState("Classroom!2026");

  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("게시판을 불러오는 중입니다.");
  const [busy, setBusy] = useState(false);

  // 게시글 목록 새로고침
  async function refresh() {
    const result = await api.list();
    setPosts(result);
  }

  // API 요청 공통 처리
  async function run(action, success) {
    setBusy(true);

    try {
      await action();
      setMessage(success);
    } catch (e) {
      const code = e.code;

      if (e.status === 401) {
        clearSession();
        reset();

        if (code === "TOKEN_EXPIRED") {
          setMessage("로그인 시간이 만료되었습니다. 다시 로그인하세요.");
        } else if (code === "INVALID_CREDENTIALS") {
          setMessage("이메일 또는 비밀번호가 올바르지 않습니다.");
        } else {
          setMessage("인증에 실패했습니다. 다시 로그인하세요.");
        }
      } else if (e.status === 403) {
        setMessage("다른 사용자의 게시글을 수정하거나 삭제할 수 없습니다.");
      } else if (e.status === 404) {
        setSelected(null);
        reset();
        setMessage("게시글이 존재하지 않습니다. 목록을 새로고침하세요.");
      } else if (e.status === 400) {
        setMessage(e.message || "입력값을 확인하세요.");
      } else {
        setMessage(e.message || "요청 처리 중 오류가 발생했습니다.");
      }
    } finally {
      setUser(getSession().user);
      setBusy(false);
    }
  }

  useEffect(() => {
    run(refresh, "게시판이 준비되었습니다.");
  }, []);

  // 글 작성·수정 입력 초기화
  function reset() {
    setTitle("");
    setContent("");
    setEditing(null);
  }

  // 로그인
  async function handleLogin(e) {
    e.preventDefault();

    await run(
      () => login(email, password),
      "로그인했습니다."
    );
  }

  // 로그아웃
  function handleLogout() {
    clearSession();
    setUser(null);
    reset();
    setMessage("로그아웃되었습니다.");
  }

  // 게시글 등록 및 수정
  async function save(e) {
    e.preventDefault();

    if (!getSession().user) {
      setMessage("게시글을 작성하려면 먼저 로그인하세요.");
      return;
    }

    await run(async () => {
      const post = editing
        ? await api.update(editing, { title, content })
        : await api.create({ title, content });

      setSelected(post);
      reset();
      await refresh();
    }, "게시글을 저장했습니다.");
  }

  // 게시글 상세 조회
  async function showDetail(id) {
    await run(async () => {
      const post = await api.detail(id);
      setSelected(post);
    }, "게시글을 불러왔습니다.");
  }

  // 게시글 삭제
  async function deletePost(id) {
    if (!window.confirm("게시글을 삭제할까요?")) {
      return;
    }

    await run(async () => {
      await api.remove(id);
      setSelected(null);
      reset();
      await refresh();
    }, "게시글을 삭제했습니다.");
  }

  // 내 정보 조회
  async function showMe() {
    if (!getSession().user) {
      setMessage("먼저 로그인하세요.");
      return;
    }

    await run(async () => {
      const me = await api.me();
      window.alert(`${me.name} (${me.email})`);
    }, "내 정보 조회를 완료했습니다.");
  }

  return (
    <main>
      <header>
        <span className="eyebrow">
          WEB SERVICE DESIGN · JWT BOARD
        </span>

        <h1>우리의 학습 기록</h1>

        <p className="muted">
          자유롭게 학습 내용을 작성하고 공유하는 게시판입니다.
        </p>
      </header>

      <p className="banner">
        누구나 게시글을 읽을 수 있습니다.
        로그인한 사용자는 글을 작성할 수 있으며,
        자신이 작성한 글만 수정하거나 삭제할 수 있습니다.
      </p>

      <div role="status" className="message">
        {message}
      </div>

      <div className="grid">
        <aside>
          {/* 로그인 영역 */}
          <section className="card">
            <h2>로그인</h2>

            <p>
              {user
                ? `${user.name}님 로그인 중`
                : "로그아웃 상태"}
            </p>

            <form onSubmit={handleLogin}>
              <label>
                이메일
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              <label>
                비밀번호
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>

              <div className="actions">
                <button type="submit" disabled={busy}>
                  로그인
                </button>

                <button
                  type="button"
                  className="secondary"
                  onClick={handleLogout}
                >
                  로그아웃
                </button>
              </div>
            </form>

            <p>
              <small>
                테스트 계정
                <br />
                Alice: alice@class.test
                <br />
                Bob: bob@class.test
                <br />
                공통 비밀번호: Classroom!2026
              </small>
            </p>

            <button
              type="button"
              className="secondary"
              disabled={busy}
              onClick={showMe}
            >
              내 정보 조회
            </button>
          </section>

          {/* 게시글 작성 및 수정 영역 */}
          <section className="card">
            <h2>
              {editing ? "게시글 수정" : "새 글 작성"}
            </h2>

            <form onSubmit={save}>
              <label>
                제목
                <input
                  maxLength={100}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </label>

              <label>
                내용
                <textarea
                  maxLength={5000}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </label>

              <div className="actions">
                <button type="submit" disabled={busy}>
                  {editing ? "수정 저장" : "등록"}
                </button>

                <button
                  type="button"
                  className="secondary"
                  onClick={reset}
                >
                  입력 초기화
                </button>
              </div>
            </form>
          </section>
        </aside>

        <div>
          {/* 게시글 목록 */}
          <section className="card">
            <h2>
              게시글 목록 <small>{posts.length}개</small>
            </h2>

            {posts.length === 0 ? (
              <p>첫 번째 학습 기록을 남겨 보세요.</p>
            ) : (
              posts.map((post) => (
                <article className="post" key={post.id}>
                  <button
                    className="post-title"
                    disabled={busy}
                    onClick={() => showDetail(post.id)}
                  >
                    {post.title}
                  </button>

                  <p>
                    <small>
                      {post.authorName} ·{" "}
                      {new Date(post.createdAt).toLocaleString()}
                    </small>
                  </p>
                </article>
              ))
            )}
          </section>

          {/* 게시글 상세 */}
          <section className="card">
            <h2>게시글 상세</h2>

            {selected ? (
              <>
                <h3>{selected.title}</h3>

                <p className="content">
                  {selected.content}
                </p>

                <p>
                  <small>
                    작성자: {selected.authorName}
                  </small>
                </p>

                {canEdit(selected) && (
                  <div className="actions">
                    <button
                      type="button"
                      className="secondary"
                      disabled={busy}
                      onClick={() => {
                        setEditing(selected.id);
                        setTitle(selected.title);
                        setContent(selected.content);
                      }}
                    >
                      수정
                    </button>

                    <button
                      type="button"
                      className="danger"
                      disabled={busy}
                      onClick={() => deletePost(selected.id)}
                    >
                      삭제
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="muted">
                목록에서 게시글 제목을 선택하세요.
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")).render(
  <App />
);
