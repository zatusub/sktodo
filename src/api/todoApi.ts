import type { User, Todo, Criticism } from './models';

const API_BASE_URL = 'https://keydz2ocwl.execute-api.ap-northeast-1.amazonaws.com/prod';

// モック用の遅延処理
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// モックユーザーデータ
const mockUser: User = {
  user_id: 'user-1',
  email: 'raimu@example.com',
  username: 'らいむ',
  points: 1250,
};

// モックToDoデータ
const mockTodos: Todo[] = [
  {
    todo_id: 'todo-1',
    user_id: 'user-1',
    title: '朝4時に起きる',
    description: 'もう起床時間からやり直そう',
    is_completed: false,
    is_disguised: false,
    created_at: '2025-12-10T08:00:00Z',
    updated_at: '2025-12-10T08:00:00Z',
  },
  {
    todo_id: 'todo-2',
    user_id: 'user-1',
    title: '今日の報告書を提出する',
    description: '15時までに完成させる',
    is_completed: false,
    is_disguised: false,
    created_at: '2025-12-11T09:30:00Z',
    updated_at: '2025-12-11T09:30:00Z',
  },
  {
    todo_id: 'todo-3',
    user_id: 'user-1',
    title: '筋トレを1時間やる',
    description: 'ジムで背中と胸を鍛える',
    is_completed: false,
    is_disguised: false,
    created_at: '2025-12-12T07:00:00Z',
    updated_at: '2025-12-12T07:00:00Z',
  },
  {
    todo_id: 'todo-4',
    user_id: 'user-1',
    title: 'ドキュメント更新',
    description: 'APIドキュメントを最新版に',
    is_completed: true,
    is_disguised: false,
    created_at: '2025-12-09T10:00:00Z',
    updated_at: '2025-12-09T10:00:00Z',
  },
];

/**
 * AI から ToDo に対する批判を取得
 */
export async function fetchTodoCriticism(todo: string): Promise<string> {
  try {
    const apiKey = import.meta.env.VITE_AI_API_KEY as string | undefined;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }

    const response = await fetch(`${API_BASE_URL}/criticism/todo`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ todo }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const criticism = await response.text();
    return criticism;
  } catch (error) {
    console.error('Failed to fetch todo criticism:', error);
    // フォールバック
    return 'そんなことやってんの？もっと大事なことあんじゃない？';
  }
}

/**
 * AI から活動に対する煽りを取得
 */
export async function fetchActivityIncite(content: string): Promise<string> {
  try {
    const apiKey = import.meta.env.VITE_AI_API_KEY as string | undefined;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }

    const response = await fetch(`${API_BASE_URL}/incite`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const incite = await response.text();
    return incite;
  } catch (error) {
    console.error('Failed to fetch activity incite:', error);
    // フォールバック
    return 'その程度の活動で満足なの？もっとやれよ！';
  }
}

export async function fetchCurrentUser(): Promise<User> {
  await delay(300);
  return mockUser;
}

export async function fetchTodosByUser(userId: string): Promise<Todo[]> {
  await delay(400);
  return mockTodos.filter(todo => todo.user_id === userId);
}

export async function fetchLatestCriticism(): Promise<Criticism> {
  // ランダムなToDoから批判を取得
  const randomTodo = mockTodos[Math.floor(Math.random() * mockTodos.length)];
  const criticismText = await fetchTodoCriticism(randomTodo.title);

  return {
    id: 'crit-' + Date.now(),
    user_id: 'ai-system',
    username: 'AI批判システム',
    message: criticismText,
    created_at: new Date().toISOString(),
  };
}

export async function completeTodo(todoId: string): Promise<Todo> {
  await delay(300);
  const todo = mockTodos.find(t => t.todo_id === todoId);
  if (todo) {
    todo.is_completed = true;
  }
  return todo!;
}

export async function addPoints(userId: string, points: number): Promise<User> {
  await delay(300);
  if (mockUser.user_id !== userId) {
    throw new Error('User not found');
  }
  mockUser.points += points;
  return mockUser;
}
