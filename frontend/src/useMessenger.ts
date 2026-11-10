import {computed, reactive, ref} from 'vue'

import {formatLastSeen, truncate} from '@/utils/format'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const NOW = Date.now()

const ago = (offset: number): number => NOW - offset

export interface Person {
  id: string
  name: string
  handle: string
  peerId?: string
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
  pinned: boolean
  muted: boolean
  unread: number
  lastMessageAt: number
  typingUserId?: string
}

export type FilterId = 'all' | 'unread' | 'pinned'

export interface FilterItem {
  id: FilterId
  label: string
  count?: number
}

export type MobileView = 'list' | 'chat'

export const people = reactive<Record<string, Person>>({
  you: {
    id: 'you',
    name: 'Alex Morgan',
    handle: '@alexmorgan',
    peerId: '12D3KooWQ7xJm4Xz9bFk2Lr8TnV5pYc6Hs3Gw1Ae',
    online: true,
  },
  maya: {
    id: 'maya',
    name: 'Maya Collins',
    handle: '@mayacollins',
    online: true,
  },
  daniel: {
    id: 'daniel',
    name: 'Daniel Reed',
    handle: '@danielreed',
    online: true,
  },
  nina: {
    id: 'nina',
    name: 'Nina Park',
    handle: '@ninapark',
    online: false,
    lastSeen: ago(28 * MINUTE),
  },
  omar: {
    id: 'omar',
    name: 'Omar Haddad',
    handle: '@omadhaddad',
    online: false,
    lastSeen: ago(5 * HOUR),
  },
  priya: {
    id: 'priya',
    name: 'Priya Shah',
    handle: '@priyashah',
    online: true,
  },
  tom: {
    id: 'tom',
    name: 'Tom Becker',
    handle: '@tombecker',
    online: false,
    lastSeen: ago(2 * DAY),
  },
  lena: {
    id: 'lena',
    name: 'Lena Fischer',
    handle: '@lenafischer',
    online: true,
  },
})

export const currentUser = people.you

let messageSequence = 0

function message(
    senderId: string,
    createdAt: number,
    text: string,
    extra: Partial<Message> = {},
): Message {
  return {
    id: `demo-message-${++messageSequence}`,
    senderId,
    text,
    createdAt,
    status: 'read',
    ...extra,
  }
}

const chats = ref<Chat[]>([
  {
    id: 'maya',
    title: 'Maya Collins',
    contactId: 'maya',
    pinned: true,
    muted: false,
    unread: 2,
    lastMessageAt: ago(2 * MINUTE),
    typingUserId: 'maya',
  },
  {
    id: 'daniel',
    title: 'Daniel Reed',
    contactId: 'daniel',
    pinned: false,
    muted: false,
    unread: 0,
    lastMessageAt: ago(1 * HOUR),
  },
  {
    id: 'priya',
    title: 'Priya Shah',
    contactId: 'priya',
    pinned: false,
    muted: false,
    unread: 1,
    lastMessageAt: ago(26 * HOUR),
  },
  {
    id: 'nina',
    title: 'Nina Park',
    contactId: 'nina',
    pinned: false,
    muted: false,
    unread: 0,
    lastMessageAt: ago(27 * HOUR),
  },
  {
    id: 'omar',
    title: 'Omar Haddad',
    contactId: 'omar',
    pinned: false,
    muted: true,
    unread: 0,
    lastMessageAt: ago(3 * DAY),
  },
])

const messages = ref<Record<string, Message[]>>({
  maya: [
    message('you', ago(2 * HOUR), 'Hey Maya, do you have a minute to look at the chat header?'),
    message('maya', ago(1.92 * HOUR),
        'Sure. I think the status line should stay quiet — one line, no badges.'),
    message('you', ago(1.84 * HOUR), "Agreed. I'll simplify it."),
    message('maya', ago(1.67 * HOUR),
        'Also, the composer could grow up to four lines before it scrolls.'),
    message('you', ago(1.5 * HOUR), 'Good call.'),
    message('maya', ago(3 * MINUTE), 'The prototype is ready whenever you are.'),
    message('maya', ago(2 * MINUTE),
        'I also added the compact message spacing we talked about.'),
  ],
  daniel: [
    message('daniel', ago(7 * HOUR), 'The build is green again.'),
    message('you', ago(6.84 * HOUR), 'Great, thanks for chasing that down.'),
    message('daniel', ago(6.67 * HOUR),
        'No problem. The flaky test was a timing issue.'),
    message('you', ago(1 * HOUR), 'Sounds good, see you then.'),
  ],
  priya: [
    message('priya', ago(30 * HOUR),
        'I finished the interview summaries — three clear patterns.'),
    message('you', ago(29 * HOUR), "That's helpful. Anything surprising?"),
    message('priya', ago(26 * HOUR),
        "People want fewer controls, not more. I'll drop the notes in the channel."),
  ],
  nina: [
    message('you', ago(31 * HOUR), 'The new type scale looks much better in the app.'),
    message('nina', ago(30 * HOUR),
        'Thank you! I was worried it would feel too tight.'),
    message('you', ago(28 * HOUR), 'Not at all. It reads well on small screens.'),
    message('nina', ago(27 * HOUR), 'Thanks for the feedback!'),
  ],
  omar: [
    message('omar', ago(4 * DAY), 'I moved the sync notes into the shared doc.'),
    message('you', ago(4 * DAY - 10 * MINUTE), "Got it. I'll send the files tonight."),
  ],
})

const activeChatId = ref<string | null>(null)
const filter = ref<FilterId>('all')
const search = ref('')
const newChatOpen = ref(false)
const mobileView = ref<MobileView>('list')

const activeChat = computed<Chat | null>(
    () => chats.value.find((chat) => chat.id === activeChatId.value) ?? null,
)

const activeMessages = computed<Message[]>(() => {
  const chatId = activeChatId.value
  return chatId ? messages.value[chatId] ?? [] : []
})

const activeContact = computed<Person | null>(() => {
  const contactId = activeChat.value?.contactId
  return contactId ? people[contactId] ?? null : null
})

const activeTypingUser = computed<Person | null>(() => {
  const id = activeChat.value?.typingUserId
  return id ? people[id] ?? null : null
})

const totalUnread = computed<number>(
    () => chats.value.reduce((total, chat) => total + (chat.unread || 0), 0),
)

const directContactIds = computed<Set<string>>(
    () => new Set(chats.value.map((chat) => chat.contactId)),
)

const availablePeople = computed<Person[]>(
    () => Object.values(people).filter(
        (person) => person.id !== currentUser.id && !directContactIds.value.has(person.id),
    ),
)

export function lastMessageOf(chatId: string): Message | null {
  const list = messages.value[chatId]
  return list?.length ? list[list.length - 1] : null
}

export function senderNameFor(userId: string): string {
  return people[userId]?.name ?? 'Unknown'
}

export function firstNameFor(userId: string): string {
  return senderNameFor(userId).split(' ')[0]
}

export function isMine(messageItem: Message): boolean {
  return messageItem.senderId === currentUser.id
}

function previewFor(chat: Chat): string {
  if (chat.typingUserId)
    return `${firstNameFor(chat.typingUserId)} is typing…`

  const last = lastMessageOf(chat.id)
  if (!last)
    return 'No messages yet'

  const prefix = last.senderId === currentUser.id ? 'You: ' : ''

  return truncate(prefix + last.text, 54)
}

const sortedChats = computed<Chat[]>(() => {
  const query = search.value.trim().toLowerCase()

  return chats.value
      .filter((chat) => {
        if (filter.value === 'unread' && !chat.unread)
          return false
        if (filter.value === 'pinned' && !chat.pinned)
          return false
        if (!query)
          return true
        return chat.title.toLowerCase().includes(query)
            || previewFor(chat).toLowerCase().includes(query)
      })
      .slice()
      .sort((first, second) => Number(second.pinned) - Number(first.pinned)
          || second.lastMessageAt - first.lastMessageAt)
})

const filters = computed<FilterItem[]>(() => [
  {id: 'all', label: 'All'},
  {id: 'unread', label: 'Unread', count: totalUnread.value},
  {id: 'pinned', label: 'Pinned'},
])

const presenceLabel = computed<string>(() => {
  const contact = activeContact.value
  if (!contact)
    return ''
  if (contact.online)
    return 'Online'
  return formatLastSeen(contact.lastSeen)
})

const introText = computed<string>(() => {
  if (!activeChat.value)
    return ''
  return activeContact.value
    ? `This is the beginning of your conversation with ${activeContact.value.name}.`
    : ''
})

function isTyping(chat: Chat): boolean {
  return Boolean(chat.typingUserId)
}

function setFilter(value: FilterId): void {
  filter.value = value
}

function selectChat(chatId: string): void {
  activeChatId.value = chatId
  const chat = chats.value.find((item) => item.id === chatId)
  if (chat)
    chat.unread = 0
  newChatOpen.value = false
  mobileView.value = 'chat'
}

function backToList(): void {
  mobileView.value = 'list'
}

function markAllRead(): void {
  for (const chat of chats.value)
    chat.unread = 0
}

function toggleNewChat(): void {
  newChatOpen.value = !newChatOpen.value
}

function startChat(person: Person): void {
  const existing = chats.value.find((chat) => chat.contactId === person.id)
  if (existing) {
    selectChat(existing.id)
    return
  }

  const chat: Chat = {
    id: `dm-${person.id}`,
    title: person.name,
    contactId: person.id,
    pinned: false,
    muted: false,
    unread: 0,
    lastMessageAt: 0,
  }
  chats.value.push(chat)
  messages.value[chat.id] = []
  selectChat(chat.id)
}

function sendMessage(text: string): boolean {
  const chat = activeChat.value
  const trimmed = text.trim()
  if (!chat || !trimmed)
    return false

  const timestamp = Date.now()
  const item: Message = {
    id: `local-${timestamp}-${Math.random().toString(16).slice(2)}`,
    senderId: currentUser.id,
    text: trimmed,
    createdAt: timestamp,
    status: 'sent',
  }

  if (!messages.value[chat.id])
    messages.value[chat.id] = []
  messages.value[chat.id].push(item)
  chat.lastMessageAt = timestamp
  chat.unread = 0
  chat.typingUserId = undefined

  window.setTimeout(() => {
    const stored = messages.value[chat.id]?.find((messageItem) => messageItem.id === item.id)
    if (stored)
      stored.status = 'read'
  }, 900)

  return true
}

export function useMessenger() {
  return {
    currentUser,
    chats,
    activeChat,
    activeContact,
    activeMessages,
    activeTypingUser,
    activeChatId,
    filter,
    search,
    filters,
    sortedChats,
    totalUnread,
    availablePeople,
    newChatOpen,
    mobileView,
    presenceLabel,
    introText,
    lastMessageOf,
    senderNameFor,
    firstNameFor,
    isMine,
    isTyping,
    previewFor,
    setFilter,
    selectChat,
    backToList,
    markAllRead,
    toggleNewChat,
    startChat,
    sendMessage,
  }
}
