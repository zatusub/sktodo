// src/lib/aiApi.ts

const PROD_BASE = "https://keydz2ocwl.execute-api.ap-northeast-1.amazonaws.com/prod";
// localhost開発中は Vite proxy を使う
const API_BASE = import.meta.env.DEV ? "/awsapi" : PROD_BASE;

type TodoLite = { title: string; description?: string | null };

// 単体（互換用）
export async function critiqueTodo(todo: string): Promise<string> {
  const res = await fetch(`${API_BASE}/criticism/todo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // 既存仕様（{todo:"..."}）で動いてたならこれでもOK
    body: JSON.stringify({ todo }),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`API error ${res.status}: ${text}`);
  return text;
}

// 複数タスク一括（新仕様）
export async function critiqueTodoBatch(params: {
  targetTodo: TodoLite;
  otherTodos: TodoLite[];
}): Promise<string> {
  const res = await fetch(`${API_BASE}/criticism/todo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`API error ${res.status}: ${text}`);
  return text;
}
