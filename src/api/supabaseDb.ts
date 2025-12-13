/**
 * Supabase データベース操作のヘルパー関数
 * 主に todos, friendships, disruptions テーブルの CRUD
 */

import { supabase } from '../lib/supabaseClient'
import type { User, Todo } from './models'

// ===================================================================
// users テーブル
// ===================================================================

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return null

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', authUser.id)
      .single()

    if (error) {
      console.error('Failed to fetch current user:', error)
      return null
    }

    return {
      user_id: data.user_id,
      email: data.email,
      username: data.username,
      points: data.points
    }
  } catch (err) {
    console.error('Error getting current user:', err)
    return null
  }
}

// ===================================================================
// todos テーブル
// ===================================================================

export const getUserTodos = async (userId: string): Promise<Todo[]> => {
  try {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch todos:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.error('Error fetching todos:', err)
    return []
  }
}

export const createTodo = async (
  userId: string,
  title: string,
  description: string = '',
  deadlineAt?: string
): Promise<Todo | null> => {
  try {
    const { data, error } = await supabase
      .from('todos')
      .insert({
        user_id: userId,
        title,
        description,
        deadline_at: deadlineAt,
        is_completed: false,
        is_disguised: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create todo:', error)
      return null
    }

    return data
  } catch (err) {
    console.error('Error creating todo:', err)
    return null
  }
}

export const updateTodo = async (
  todoId: string,
  updates: Partial<Todo>
): Promise<Todo | null> => {
  try {
    const { data, error } = await supabase
      .from('todos')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('todo_id', todoId)
      .select()
      .single()

    if (error) {
      console.error('Failed to update todo:', error)
      return null
    }

    return data
  } catch (err) {
    console.error('Error updating todo:', err)
    return null
  }
}

export const completeTodo = async (todoId: string): Promise<Todo | null> => {
  return updateTodo(todoId, { is_completed: true })
}

export const deleteTodo = async (todoId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('todo_id', todoId)

    if (error) {
      console.error('Failed to delete todo:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Error deleting todo:', err)
    return false
  }
}

// ===================================================================
// friendships テーブル
// ===================================================================

export const createFriendRequest = async (
  targetUserId: string
): Promise<boolean> => {
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return false

    const { error } = await supabase
      .from('friendships')
      .insert({
        user_id_1: authUser.id,
        user_id_2: targetUserId,
        status: 'pending',
        requester_id: authUser.id,
        requested_at: new Date().toISOString()
      })

    if (error) {
      console.error('Failed to create friend request:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Error creating friend request:', err)
    return false
  }
}

export const acceptFriendship = async (
  friendshipId: string
): Promise<boolean> => {
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return false

    const { error } = await supabase
      .from('friendships')
      .update({
        status: 'accepted',
        responded_at: new Date().toISOString()
      })
      .eq('friendship_id', friendshipId)
      .eq('user_id_2', authUser.id)

    if (error) {
      console.error('Failed to accept friendship:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Error accepting friendship:', err)
    return false
  }
}

export const rejectFriendship = async (
  friendshipId: string
): Promise<boolean> => {
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return false

    const { error } = await supabase
      .from('friendships')
      .update({
        status: 'rejected',
        responded_at: new Date().toISOString()
      })
      .eq('friendship_id', friendshipId)
      .eq('user_id_2', authUser.id)

    if (error) {
      console.error('Failed to reject friendship:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Error rejecting friendship:', err)
    return false
  }
}

// ===================================================================
// disruptions テーブル
// ===================================================================

export const createDisruption = async (
  targetTodoId: string,
  pointsSpent: number,
  disruptionType: string = 'hide'
): Promise<boolean> => {
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return false

    // ユーザーのポイントをチェック
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.points < pointsSpent) {
      console.error('Not enough points')
      return false
    }

    // disruption を作成
    const { error: insertError } = await supabase
      .from('disruptions')
      .insert({
        disruptor_id: authUser.id,
        target_todo_id: targetTodoId,
        points_spent: pointsSpent,
        disruption_type: disruptionType,
        created_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Failed to create disruption:', insertError)
      return false
    }

    // disruptor のポイントを減らす
    const { data: userData } = await supabase
      .from('users')
      .select('points')
      .eq('user_id', authUser.id)
      .single()

    if (userData) {
      await supabase
        .from('users')
        .update({ points: userData.points - pointsSpent })
        .eq('user_id', authUser.id)
    }

    // target todo の is_disguised を更新
    if (disruptionType === 'hide') {
      await updateTodo(targetTodoId, {
        is_disguised: true,
        disguised_by: authUser.id
      })
    }

    return true
  } catch (err) {
    console.error('Error creating disruption:', err)
    return false
  }
}

export const getUserDisruptions = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('disruptions')
      .select('*')
      .eq('disruptor_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch disruptions:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.error('Error fetching disruptions:', err)
    return []
  }
}

export const getReceivedDisruptions = async (userId: string) => {
  try {
    const { data: todos, error: todosError } = await supabase
      .from('todos')
      .select('todo_id')
      .eq('user_id', userId)

    if (todosError) {
      console.error('Failed to fetch user todos:', todosError)
      return []
    }

    const todoIds = (todos as { todo_id: string }[] | undefined)?.map(t => t.todo_id) || []
    if (todoIds.length === 0) return []

    const { data, error } = await supabase
      .from('disruptions')
      .select('*')
      .in('target_todo_id', todoIds)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch received disruptions:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.error('Error fetching received disruptions:', err)
    return []
  }
}

// ===================================================================
// users テーブル (ポイント管理)
// ===================================================================

export const addPoints = async (userId: string, points: number): Promise<boolean> => {
  try {
    const { data: userData } = await supabase
      .from('users')
      .select('points')
      .eq('user_id', userId)
      .single()

    if (!userData) return false

    const { error } = await supabase
      .from('users')
      .update({ points: userData.points + points })
      .eq('user_id', userId)

    if (error) {
      console.error('Failed to add points:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Error adding points:', err)
    return false
  }
}

export const subtractPoints = async (userId: string, points: number): Promise<boolean> => {
  return addPoints(userId, -points)
}
