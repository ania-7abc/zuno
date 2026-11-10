import {createMessengerMock} from '@/mock/messenger'
import type {
  Chat,
  Message,
  PeopleMap,
  Person,
  ProfileUpdate,
} from '@/types/messenger'

export interface MessengerApi {
  fetchPeople(): PeopleMap
  fetchChats(): Chat[]
  fetchMessages(chatId: string): Message[]
  sendMessage(chatId: string, text: string): Message | null
  markChatRead(chatId: string): void
  markAllChatsRead(): void
  createChat(person: Person): Chat
  updateProfile(profile: ProfileUpdate): Person
}

const mock = createMessengerMock()

let messageSequence = 0

export function useMessenger(): MessengerApi {
  return {
    fetchPeople(): PeopleMap {
      return structuredClone(mock.people)
    },

    fetchChats(): Chat[] {
      return structuredClone(mock.chats)
    },

    fetchMessages(chatId: string): Message[] {
      return structuredClone(mock.messages[chatId] ?? [])
    },

    sendMessage(chatId: string, text: string): Message | null {
      const trimmed = text.trim()
      if (!trimmed)
        return null

      const timestamp = Date.now()
      const message: Message = {
        id: `local-${timestamp}-${++messageSequence}`,
        senderId: mock.people.you.id,
        text: trimmed,
        createdAt: timestamp,
        status: 'sent',
      }

      const list = mock.messages[chatId] ?? []
      list.push(message)
      mock.messages[chatId] = list

      return structuredClone(message)
    },

    markChatRead(chatId: string): void {
      const chat = mock.chats.find((item) => item.id === chatId)
      if (chat)
        chat.unread = 0
    },

    markAllChatsRead(): void {
      for (const chat of mock.chats)
        chat.unread = 0
    },

    createChat(person: Person): Chat {
      const chat: Chat = {
        id: `dm-${person.id}`,
        title: person.name,
        contactId: person.id,
        pinned: false,
        muted: false,
        unread: 0,
        lastMessageAt: 0,
      }

      mock.chats.push(chat)
      mock.messages[chat.id] = []

      return structuredClone(chat)
    },

    updateProfile(profile: ProfileUpdate): Person {
      Object.assign(mock.people.you, profile)
      return structuredClone(mock.people.you)
    },
  }
}
