import type {Chat, FilterId, Message, MessageMap, PeopleMap} from '@/types/messenger'
import {truncate} from '@/utils/format'

export function lastMessageOf(messages: MessageMap, chatId: string): Message | null {
  const list = messages[chatId]
  return list?.length ? list[list.length - 1] : null
}

export function senderNameFor(people: PeopleMap, userId: string): string {
  return people[userId]?.name ?? 'Unknown'
}

export function firstNameFor(people: PeopleMap, userId: string): string {
  return senderNameFor(people, userId).split(' ')[0]
}

export function isMine(message: Message, currentUserId: string): boolean {
  return message.senderId === currentUserId
}

export function isTyping(chat: Chat): boolean {
  return Boolean(chat.typingUserId)
}

export function previewFor(
    chat: Chat,
    people: PeopleMap,
    messages: MessageMap,
    currentUserId: string,
): string {
  if (chat.typingUserId)
    return `${firstNameFor(people, chat.typingUserId)} is typing…`

  const last = lastMessageOf(messages, chat.id)
  if (!last)
    return 'No messages yet'

  const prefix = last.senderId === currentUserId ? 'You: ' : ''

  return truncate(prefix + last.text, 54)
}

export function filterAndSortChats(
    chats: Chat[],
    filter: FilterId,
    search: string,
    people: PeopleMap,
    messages: MessageMap,
    currentUserId: string,
): Chat[] {
  const query = search.trim().toLowerCase()

  return chats
      .filter((chat) => {
        if (filter === 'unread' && !chat.unread)
          return false
        if (!query)
          return true
        return chat.title.toLowerCase().includes(query)
            || previewFor(chat, people, messages, currentUserId).toLowerCase().includes(query)
      })
      .slice()
      .sort((first, second) => second.lastMessageAt - first.lastMessageAt)
}
