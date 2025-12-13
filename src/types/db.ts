// src/types/db.ts

// ============== データベーススキーマに基づく型 (TODOS, USERS, FRIENDSHIPS, DISRUPTIONS) ==============

// USERS テーブル
export interface DbUser {
    user_id: string; // UUID
    email: string;
    password_hash: string;
    username: string;
    points: number; // INT DEFAULT 100 NOT NULL
    created_at: string; // TIMESTAMP WITH TIME ZONE
    updated_at: string; // TIMESTAMP WITH TIME ZONE
}

// TODOS テーブル
// FriendTodo3D.tsx で使用するため、型名を 'Todo' とします。
export interface Todo {
    // 💡 注: SQLでは todo_id ですが、フロントエンドの慣習と可読性のため、
    // ここでは DB フィールド名に合わせて id は使わず、todo_id のままにします。
    // FriendTodo3D.tsx と TaskJama.tsx のロジックもこれに合わせて修正が必要です。
    todo_id: string; // UUID PRIMARY KEY
    user_id: string; // FK
    title: string;
    description: string | null;
    deadline_at: string | null; // TIMESTAMP WITH TIME ZONE
    is_completed: boolean;
    is_disguised: boolean; // 悪魔にされたか
    disguised_by: string | null; // FK (悪魔にした人のuser_id)
    due_date: string | null; // DATE (YYYY-MM-DD)
    created_at: string; // TIMESTAMP WITH TIME ZONE
    updated_at: string; // TIMESTAMP WITH TIME ZONE
}

// FRIENDSHIPS テーブル
export interface Friendship {
    friendship_id: string; // UUID PRIMARY KEY
    user_id_1: string; // FK
    user_id_2: string; // FK
    status: 'PENDING' | 'ACCEPTED' | 'BLOCKED' | 'REJECTED';
    requester_id: string; // FK
    requested_at: string; // TIMESTAMP WITH TIME ZONE
    responded_at: string | null; // TIMESTAMP WITH TIME ZONE
    created_at: string; // TIMESTAMP WITH TIME ZONE
    updated_at: string; // TIMESTAMP WITH TIME ZONE
}

// DISRUPTIONS テーブル (TodoID とポイント消費の記録)
export interface Disruption {
    disruption_id: string; // UUID PRIMARY KEY
    disruptor_id: string; // FK (悪魔にした人)
    target_todo_id: string; // FK (悪魔にされたTodo)
    points_spent: number;
    disruption_type: string;
    created_at: string; // TIMESTAMP WITH TIME ZONE
}


// ============== フロントエンド表示用型 (TaskJama.tsx から使用) ==============

// FriendList3D に渡すフレンドリストの型
export interface Friend {
    user_id: string; 
    username: string;
}

// PendingRequests3D に渡す承認待ちリクエストの型 (JOINの結果)
export interface PendingRequest {
    friendship_id: string; // friendships.friendship_id
    requester_id: string; // friendships.requester_id
    username: string;     // users.username
    email: string;        // users.email
}