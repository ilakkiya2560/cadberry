import { supabase } from '../lib/supabase';
import { ChatSession, PersistedChatMessage } from '../types';

export function formatChatTitle(date: Date = new Date()): string {
  const formatted = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);

  return formatted.replace(/\s+/g, ' ').trim();
}

export async function createChat(userId: string, title?: string): Promise<ChatSession> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({
      user_id: userId,
      title: title || formatChatTitle(),
      is_archived: false,
    })
    .select('*')
    .single();

  if (error) {
    console.error('Failed to create chat session:', error);
    throw error;
  }

  return data as ChatSession;
}

export async function listChats(userId: string): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Failed to load chat sessions:', error);
    throw error;
  }

  return (data || []) as ChatSession[];
}

export async function getChatMessages(chatId: string, userId: string): Promise<PersistedChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('chat_id', chatId)
    .eq('user_id', userId)
    .order('message_order', { ascending: true });

  if (error) {
    console.error('Failed to load chat messages:', error);
    throw error;
  }

  return (data || []) as PersistedChatMessage[];
}

export async function saveMessage(params: {
  chatId: string;
  userId: string;
  sender: 'user' | 'cadberry';
  content: string;
  language?: string;
  metadata?: Record<string, any> | null;
}): Promise<PersistedChatMessage> {
  const { chatId, userId, sender, content, language, metadata } = params;

  const { data: currentMaxRow, error: maxError } = await supabase
    .from('chat_messages')
    .select('message_order')
    .eq('chat_id', chatId)
    .eq('user_id', userId)
    .order('message_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (maxError) {
    console.error('Failed to determine next message order:', maxError);
    throw maxError;
  }

  const nextOrder = (currentMaxRow?.message_order ?? 0) + 1;

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      chat_id: chatId,
      user_id: userId,
      sender,
      content,
      language: language ?? null,
      metadata: metadata ?? null,
      message_order: nextOrder,
    })
    .select('*')
    .single();

  if (error) {
    console.error('Failed to save chat message:', error);
    throw error;
  }

  await updateChatTimestamp(chatId, userId);

  return data as PersistedChatMessage;
}

export async function updateChatTimestamp(chatId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('chat_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', chatId)
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to update chat timestamp:', error);
    throw error;
  }
}
