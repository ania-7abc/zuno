import type {Chat, Message, MessageMap, PeopleMap, Person, ProfileUpdate} from '@/types/messenger'

import {useWebui} from './useWebui.js'

const {isConnected} = useWebui()

export interface MessengerApi {
  fetchPeople(): Promise<PeopleMap>
  fetchChats(): Chat[]
  fetchMessages(chatId: string): Message[]
  sendMessage(chatId: string, text: string): Message | null
  markChatRead(chatId: string): void
  markAllChatsRead(): void
  createChat(person: Person): Chat
  updateProfile(profile: ProfileUpdate): Person
}

let people: PeopleMap = {}
let chats: Chat[] = []
let messages: MessageMap = {}

let messageSequence = 0

export function useMessenger(): MessengerApi {
  return {
    async fetchPeople(): Promise<PeopleMap> {
      if (!isConnected.value)
        return {}

      try {
        const response = JSON.parse(await webui.call('fetchPeople')) as PeopleMap
        people = response
        return response
      } catch (error) {
        console.warn('fetchPeople failed', error)
        return {}
      }
    },

    fetchChats(): Chat[] {
      // return structuredClone(mock.chats)
      return []
    },

    fetchMessages(_chatId: string): Message[] {
      // return structuredClone(mock.messages[chatId] ?? [])
      return []
    },

    sendMessage(chatId: string, text: string): Message | null {
      const trimmed = text.trim()
      if (!trimmed)
        return null

      const timestamp = Date.now()
      const message: Message = {
        id: `local-${timestamp}-${++messageSequence}`,
        senderId: people.you.id,
        text: trimmed,
        createdAt: timestamp,
        status: 'sent',
      }

      const list = messages[chatId] ?? []
      list.push(message)
      messages[chatId] = list

      return structuredClone(message)
    },

    markChatRead(chatId: string): void {
      const chat = chats.find((item) => item.id === chatId)
      if (chat)
        chat.unread = 0
    },

    markAllChatsRead(): void {
      for (const chat of chats)
        chat.unread = 0
    },

    createChat(person: Person): Chat {
      const chat: Chat = {
        id: `dm-${person.id}`,
        title: person.name,
        contactId: person.id,
        unread: 0,
        lastMessageAt: 0,
      }

      chats.push(chat)
      messages[chat.id] = []

      return structuredClone(chat)
    },

    updateProfile(profile: ProfileUpdate): Person {
      Object.assign(people.you, profile)
      return structuredClone(people.you)
    },
  }
}
