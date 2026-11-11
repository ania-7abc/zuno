export interface Person {
  id: string
  name: string
  handle: string
  online: boolean
  lastSeen?: number
}

export interface MessageReply {
  senderId: string
  text: string
}

export type MessageStatus = 'sent' | 'read'

export interface Message {
  id: string
  senderId: string
  text: string
  createdAt: number
  status: MessageStatus
  replyTo?: MessageReply
}

export interface Chat {
  id: string
  title: string
  contactId: string
  unread: number
  lastMessageAt: number
  typingUserId?: string
}

export type FilterId = 'all' | 'unread'

export interface FilterItem {
  id: FilterId
  label: string
  count?: number
}

export type MobileView = 'list' | 'chat'

export interface ProfileUpdate {
  name: string
  handle: string
}

export type PeopleMap = Record<string, Person>
export type MessageMap = Record<string, Message[]>
