// src/home/HomePage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import "./home.css";
import SceneJama3D from "./components/SceneJama3D";

import { supabase } from "../lib/supabaseClient";
import { critiqueTodoBatch } from "../lib/aiApi";
import ErrorBoundary from "./ErrorBoundary";

type Props = {
  userId: string;
  onGoJama?: () => void;

  // 追加：任意（親から渡せば遷移できる）
  onGoBattle?: () => void;
  onGoBilling?: () => void;
};

type UserRow = {
  user_id: string;
  email: string;
  username: string;
  points: number;
};

type TodoRow = {
  todo_id: string;
  user_id: string;
  title: string;
  description: string | null;
  deadline_at: string | null;
  due_date: string | null; // ★ 追加
  is_completed: boolean;
  created_at: string;
  updated_at: string;
};

type FriendRow = {
  user_id: string;
  username: string;
};

type FriendshipRow = {
  friendship_id: string;
  user_id_1: string;
  user_id_2: string;
  status: "PENDING" | "ACCEPTED" | "BLOCKED" | "REJECTED";
};

const POINT_GAIN = 10;

function formatTodayYYYYMMDDLocal() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function makeBreakingNews(username: string, title: string) {
  const patterns = [
    `<速報>${username}氏、「${title}」をサボる`,
    `<速報>${username}氏、期限を過ぎても「${title}」を放置`,
    `<速報>${username}氏、「${title}」を忘れたフリ`,
    `<速報>${username}氏、「${title}」から逃亡か`,
  ];
  return patterns[Math.floor(Math.random() * patterns.length)];
}

export default function HomePage({
  userId,
  onGoJama,
  onGoBattle,
  onGoBilling,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const [me, setMe] = useState<UserRow | null>(null);
  const [todos, setTodos] = useState<TodoRow[]>([]);

  // ★ 友達の速報（テロップ用）
  const [friendNews, setFriendNews] = useState<string[]>([]);
  const [friendNewsLoading, setFriendNewsLoading] = useState(false);

  // AI
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState("（ここにAIの批判が出る）");

  // 選択（AIのtargetTodoに使う）
  const [selectedTodoId, setSelectedTodoId] = useState("");

  // AI邪魔オーバーレイ
  const [overlayOn, setOverlayOn] = useState(true);
  const [overlayPos, setOverlayPos] = useState({ x: 40, y: 140 });
  const overlayVelRef = useRef({ vx: 1.4, vy: 1.1 });
  const overlayTimerRef = useRef<number | null>(null);

  const notDoneTodos = useMemo(
    () => todos.filter((t) => !t.is_completed),
    [todos]
  );

  const selectedTodo = useMemo(() => {
    return (
      notDoneTodos.find((t) => t.todo_id === selectedTodoId) ??
      notDoneTodos[0] ??
      null
    );
  }, [notDoneTodos, selectedTodoId]);

  const overdueTodos = useMemo(() => {
    const now = Date.now();
    return notDoneTodos.filter(
      (t) => t.deadline_at && new Date(t.deadline_at).getTime() < now
    );
  }, [notDoneTodos]);

  const intensity = useMemo(
    () => Math.min(1, 0.25 + overdueTodos.length * 0.15),
    [overdueTodos.length]
  );

  // ----------------------------
  // fetch（自分）
  // ----------------------------
  const fetchHomeData = async () => {
    setLoading(true);
    setErrMsg("");

    try {
      // users
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("user_id,email,username,points")
        .eq("user_id", userId)
        .single();

      if (userError) throw userError;
      setMe(userData as UserRow);

      // todos（自分だけ）
      const { data: todoData, error: todoError } = await supabase
        .from("todos")
        .select(
          "todo_id,user_id,title,description,deadline_at,due_date,is_completed,created_at,updated_at"
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (todoError) throw todoError;

      const rows = (todoData ?? []) as TodoRow[];
      setTodos(rows);

      const notDone = rows.filter((t) => !t.is_completed);
      if (notDone.length > 0) {
        setSelectedTodoId((prev) => prev || notDone[0].todo_id);
      } else {
        setSelectedTodoId("");
        setAiMessage("（未完了タスクが0件なのでAI評価できない）");
      }
    } catch (e: any) {
      setErrMsg(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // ★ 友達ニュース取得（due_date < 今日 && is_completed=false）
  // ----------------------------
  const fetchFriendBreakingNews = async () => {
    setFriendNewsLoading(true);

    try {
      const today = formatTodayYYYYMMDDLocal();

      // friendships（Acceptedのものを取る）
      const { data: fData, error: fErr } = await supabase
        .from("friendships")
        .select("friendship_id,user_id_1,user_id_2,status")
        .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
        .eq("status", "ACCEPTED");

      if (fErr) throw fErr;

      const friendships = (fData ?? []) as FriendshipRow[];
      const friendIds = friendships
        .map((f) => (f.user_id_1 === userId ? f.user_id_2 : f.user_id_1))
        .filter(Boolean);

      if (friendIds.length === 0) {
        setFriendNews([]);
        return;
      }

      // friend usernames
      const { data: uData, error: uErr } = await supabase
        .from("users")
        .select("user_id,username")
        .in("user_id", friendIds);

      if (uErr) throw uErr;

      const friends = (uData ?? []) as FriendRow[];
      const nameById = new Map(friends.map((x) => [x.user_id, x.username]));

      // overdue todos (due_date < today AND is_completed=false)
      const { data: tData, error: tErr } = await supabase
        .from("todos")
        .select("todo_id,user_id,title,due_date,is_completed")
        .in("user_id", friendIds)
        .eq("is_completed", false)
        .not("due_date", "is", null)
        .lt("due_date", today)
        .order("due_date", { ascending: true });

      if (tErr) throw tErr;

      const overdue = (tData ?? []) as Array<{
        todo_id: string;
        user_id: string;
        title: string;
        due_date: string | null;
        is_completed: boolean;
      }>;

      const news = overdue.slice(0, 8).map((t) => {
        const uname = nameById.get(t.user_id) ?? "友人";
        return makeBreakingNews(uname, t.title);
      });

      setFriendNews(news);
    } catch (e) {
      console.warn("fetchFriendBreakingNews failed:", e);
      setFriendNews([]);
    } finally {
      setFriendNewsLoading(false);
    }
  };

  // 初回ロード + 1分ごと更新（テロップの中身を勝手に変える）
  useEffect(() => {
    fetchHomeData();
    fetchFriendBreakingNews();

    const timer = window.setInterval(() => {
      fetchFriendBreakingNews();
    }, 60_000);

    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ----------------------------
  // AI：未完了タスクを一括批判（自動）
  // ----------------------------
  useEffect(() => {
    const run = async () => {
      if (!selectedTodo) return;
      if (notDoneTodos.length === 0) return;

      setAiLoading(true);
      setAiMessage("AIが批判を生成中…");

      try {
        const target = {
          title: selectedTodo.title,
          description: selectedTodo.description ?? undefined,
        };
        const others = notDoneTodos
          .filter((t) => t.todo_id !== selectedTodo.todo_id)
          .map((t) => ({
            title: t.title,
            description: t.description ?? undefined,
          }));

        const msg = await critiqueTodoBatch({
          targetTodo: target,
          otherTodos: others,
        });
        setAiMessage(msg || "（空の返答）");
      } catch (e: any) {
        setAiMessage(`（AI失敗）${e?.message ?? String(e)}`);
      } finally {
        setAiLoading(false);
      }
    };

    const t = window.setTimeout(run, 350);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTodo?.todo_id, notDoneTodos.length]);

  // ----------------------------
  // AI邪魔オーバーレイ：勝手に移動
  // ----------------------------
  useEffect(() => {
    if (!overlayOn) return;

    const step = () => {
      const { innerWidth: w, innerHeight: h } = window;
      const boxW = 320;
      const boxH = 140;

      setOverlayPos((p) => {
        let x = p.x + overlayVelRef.current.vx;
        let y = p.y + overlayVelRef.current.vy;

        if (x < 10) {
          x = 10;
          overlayVelRef.current.vx *= -1;
        }
        if (y < 10) {
          y = 10;
          overlayVelRef.current.vy *= -1;
        }
        if (x > w - boxW - 10) {
          x = w - boxW - 10;
          overlayVelRef.current.vx *= -1;
        }
        if (y > h - boxH - 10) {
          y = h - boxH - 10;
          overlayVelRef.current.vy *= -1;
        }

        return { x, y };
      });

      overlayTimerRef.current = window.setTimeout(step, 16);
    };

    overlayTimerRef.current = window.setTimeout(step, 16);
    return () => {
      if (overlayTimerRef.current) window.clearTimeout(overlayTimerRef.current);
      overlayTimerRef.current = null;
    };
  }, [overlayOn]);

  // ----------------------------
  // 完了処理：DB更新 + points +10 + 一覧から消す
  // ----------------------------
  const completeTodo = async (todo: TodoRow) => {
    const ok = window.confirm(
      `「${todo.title}」を完了にしますか？\n完了すると一覧から消えます。`
    );
    if (!ok) return;

    try {
      const { error: todoErr } = await supabase
        .from("todos")
        .update({ is_completed: true, updated_at: new Date().toISOString() })
        .eq("todo_id", todo.todo_id)
        .eq("user_id", userId);

      if (todoErr) throw todoErr;

      const currentPoints = me?.points ?? 0;
      const nextPoints = currentPoints + POINT_GAIN;

      const { error: userErr } = await supabase
        .from("users")
        .update({ points: nextPoints, updated_at: new Date().toISOString() })
        .eq("user_id", userId);

      if (userErr) throw userErr;

      setTodos((prev) =>
        prev.map((t) =>
          t.todo_id === todo.todo_id ? { ...t, is_completed: true } : t
        )
      );
      setMe((prev) => (prev ? { ...prev, points: nextPoints } : prev));

      setSelectedTodoId((prevSelected) => {
        if (prevSelected !== todo.todo_id) return prevSelected;
        const remaining = notDoneTodos.filter((t) => t.todo_id !== todo.todo_id);
        return remaining[0]?.todo_id ?? "";
      });

      setAiMessage(`【完了】「${todo.title}」？やればできるじゃん。次は？`);

      // 自分が完了したら、ついでにニュース更新（任意）
      fetchFriendBreakingNews();
    } catch (e: any) {
      alert(`完了処理に失敗: ${e?.message ?? String(e)}`);
    }
  };

  // ★ 速報テロップの表示文
  const breakingText = useMemo(() => {
    if (friendNewsLoading) return "速報を収集中…";
    if (!friendNews || friendNews.length === 0) return "速報はありません";
    // テロップなので連結して流す
    return friendNews.join("　／　");
  }, [friendNews, friendNewsLoading]);

  return (
    <div className="tj-root">
      <div className="tj-bg3d" aria-hidden>
        <ErrorBoundary
          fallback={
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 30% 20%, rgba(0,0,0,0.08), transparent 55%)",
              }}
            />
          }
        >
          <SceneJama3D intensity={intensity} />
        </ErrorBoundary>
      </div>

      {/* AI邪魔オーバーレイ */}
      {overlayOn ? (
        <div
          style={{
            position: "fixed",
            left: overlayPos.x,
            top: overlayPos.y,
            zIndex: 9999,
            width: 320,
            pointerEvents: "auto",
            userSelect: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              padding: 12,
              borderRadius: 14,
              background: "rgba(0,0,0,0.82)",
              color: "white",
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
              backdropFilter: "blur(6px)",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #ff4d4d, #7a00ff)",
                flex: "0 0 auto",
                position: "relative",
              }}
              title="ここを画像に差し替え"
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 900,
                }}
              >
                😈
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>
                ToDo批判AI（自動）{aiLoading ? " / 生成中…" : ""}
              </div>
              <div
                style={{
                  fontSize: 13,
                  lineHeight: 1.4,
                  whiteSpace: "pre-wrap",
                }}
              >
                {aiMessage}
              </div>

              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  gap: 8,
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => setOverlayOn(false)}
                  style={{
                    border: "none",
                    padding: "6px 10px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.12)",
                    color: "white",
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  非表示
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ position: "fixed", right: 16, bottom: 16, zIndex: 9999 }}>
          <button
            onClick={() => setOverlayOn(true)}
            style={{
              border: "none",
              padding: "10px 12px",
              borderRadius: 14,
              background: "rgba(0,0,0,0.82)",
              color: "white",
              cursor: "pointer",
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            }}
          >
            😈 AIを戻す
          </button>
        </div>
      )}

      <header className="tj-header">
        {/* ★ テレビの速報テロップ（横スクロール） */}
        <div className="tj-breakingBar">
          <div className="tj-breakingLabel">速報</div>
          <div className="tj-breakingMarquee">
            <div className="tj-breakingInner">{breakingText}</div>
          </div>
        </div>

        <div className="tj-brand">
          <div>
            <img className="tj-logo" src="/logo.png" alt="Sitya Katya ToDo" />
          </div>
        </div>

        <div className="tj-news">
          <div className="tj-newsLabel">お知らせ</div>
          <div className="tj-newsList">
            {loading ? (
              <div className="tj-newsItem warn">Loading...</div>
            ) : errMsg ? (
              <div className="tj-newsItem danger">{errMsg}</div>
            ) : (
              <div className="tj-newsItem warn">
                のこりのTODO: {notDoneTodos.length} 件
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="tj-main">
        <section className="tj-card tj-userCard">
          <div className="tj-userTop">
            <div className="tj-userName">{me?.username ?? "Guest"}</div>
            <div className="tj-points">
              <div className="tj-pointsLabel">points</div>
              <div className="tj-pointsValue">{me?.points ?? 0}pt</div>
            </div>
          </div>

          <div className={`tj-alert ${overdueTodos.length ? "danger" : "ok"}`}>
            {overdueTodos.length
              ? `期限切れ ${overdueTodos.length} 件。ニュース確定。`
              : "期限切れ 0 件。今のうちに。"}
          </div>

          {/* ボタン列 */}
          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <button
              className="tj-evilBtn"
              onClick={() => {
                fetchHomeData();
                fetchFriendBreakingNews();
              }}
              disabled={loading}
              type="button"
            >
              {loading ? "更新中…" : "再読み込み"}
            </button>

            {onGoJama ? (
              <button className="tj-evilBtn" onClick={onGoJama} type="button">
                友達のタスクを邪魔しよう
              </button>
            ) : null}

            {/* ✅ バトルボタン */}
            <button
              className="tj-evilBtn"
              onClick={() =>
                onGoBattle ? onGoBattle() : alert("バトル画面はまだ未実装！")
              }
              title="友達とバトル（仮）"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,77,77,0.95), rgba(122,0,255,0.95))",
                boxShadow: "0 10px 24px rgba(122,0,255,0.25)",
                border: "1px solid rgba(255,255,255,0.18)",
              }}
              type="button"
            >
              ⚔️ バトル
            </button>

            {/* ✅ 課金ボタン（金ぴか） */}
            <button
              onClick={() =>
                onGoBilling ? onGoBilling() : alert("課金ページへ（仮）")
              }
              title="課金（仮）"
              type="button"
              style={{
                border: "1px solid rgba(0,0,0,0.2)",
                padding: "10px 14px",
                borderRadius: 14,
                cursor: "pointer",
                color: "#3b2a00",
                fontWeight: 900,
                letterSpacing: 0.5,
                background:
                  "linear-gradient(180deg, #fff7b0 0%, #ffd54d 20%, #ffbf00 55%, #ffea7a 100%)",
                boxShadow:
                  "0 10px 26px rgba(255,191,0,0.35), inset 0 1px 0 rgba(255,255,255,0.7)",
                textShadow: "0 1px 0 rgba(255,255,255,0.35)",
              }}
            >
              💰 課金
            </button>

            <button
              className="tj-evilBtn"
              onClick={() => setOverlayOn((v) => !v)}
              type="button"
            >
              {overlayOn ? "AIを隠す" : "AIを表示"}
            </button>
          </div>
        </section>

        <section className="tj-card tj-tasksCard">
          <div className="tj-tasksHeader">
            <div className="tj-tasksTitle">タスク一覧（未完了のみ）</div>
          </div>

          <div className="tj-taskList">
            {!loading && notDoneTodos.length === 0 ? (
              <div className="tj-newsItem warn">
                未完了タスクが0件。…珍しいな。
              </div>
            ) : null}

            {notDoneTodos.map((t) => {
              const isSelected = t.todo_id === (selectedTodo?.todo_id ?? "");
              return (
                <div
                  key={t.todo_id}
                  className={`tj-task ${isSelected ? "over" : ""}`}
                >
                  <button
                    className={`tj-taskBtn ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedTodoId(t.todo_id)}
                    type="button"
                    style={{ flex: 1 }}
                  >
                    <div className="tj-taskTitleLine">
                      <span className="tj-badge me">ME</span>
                      <span className="tj-taskTitleText">{t.title}</span>
                    </div>
                    <div className="tj-taskDescSmall">
                      {t.description ?? "（descriptionなし）"}
                    </div>
                  </button>

                  <button
                    className="tj-doneBtn"
                    onClick={() => completeTodo(t)}
                    type="button"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    完了
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="tj-footer">
        <div className="tj-marquee">
          <div className="tj-marqueeInner">
            {" "}
            ⚠︎ 早くしなければ邪魔が来る ⚠︎ 完了で+10pt ⚠︎ 害悪あり ⚠︎
          </div>
        </div>
      </footer>
    </div>
  );
}
