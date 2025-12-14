export interface User {
  user_id: string;
  email: string;
  username: string;
  points: number;
}

export interface Todo {
  todo_id: string;
  user_id: string;
  title: string;
  description?: string;
  is_completed: boolean;
  is_disguised: boolean;
  disguised_by?: string;
  deadline_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Criticism {
  id: string;
  user_id: string;
  username: string;
  message: string;
  created_at: string;
}
