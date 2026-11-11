import {computed, reactive, ref} from 'vue'

import {useMessenger} from '@/useMessenger'
import type {
  Chat,
  FilterId,
  FilterItem,
  Message,
  MobileView,
  PeopleMap,
  Person,
  ProfileUpdate,
} from '@/types/messenger'
import {formatLastSeen} from '@/utils/format'
import {
  filterAndSortChats,
  firstNameFor as firstNameForPerson,
  isMine as isMessageMine,
  isTyping as isChatTyping,
  lastMessageOf as findLastMessage,
  previewFor as buildPreview,
  senderNameFor as findSenderName,
} from '@/utils/messenger'

const api = useMessenger()

const people = reactive<PeopleMap>(await api.fetchPeople())
const currentUser = people.you

const chats = ref<Chat[]>(api.fetchChats())
const messages = ref<Record<string, Message[]>>(
  Object.fromEntries(chats.value.map((chat) => [chat.id, api.fetchMessages(chat.id)])),
)

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

const sortedChats = computed<Chat[]>(
    () => filterAndSortChats(
        chats.value,
        filter.value,
        search.value,
        people,
        messages.value,
        currentUser.id,
    ),
)

const filters = computed<FilterItem[]>(() => [
  {id: 'all', label: 'All'},
  {id: 'unread', label: 'Unread', count: totalUnread.value},
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

function lastMessageOf(chatId: string): Message | null {
  return findLastMessage(messages.value, chatId)
}

function senderNameFor(userId: string): string {
  return findSenderName(people, userId)
}

function firstNameFor(userId: string): string {
  return firstNameForPerson(people, userId)
}

function isMine(message: Message): boolean {
  return isMessageMine(message, currentUser.id)
}

function previewFor(chat: Chat): string {
  return buildPreview(chat, people, messages.value, currentUser.id)
}

function isTyping(chat: Chat): boolean {
  return isChatTyping(chat)
}

function setFilter(value: FilterId): void {
  filter.value = value
}

function selectChat(chatId: string): void {
  activeChatId.value = chatId
  const chat = chats.value.find((item) => item.id === chatId)
  if (chat)
    chat.unread = 0
  api.markChatRead(chatId)
  newChatOpen.value = false
  mobileView.value = 'chat'
}

function backToList(): void {
  mobileView.value = 'list'
}

function markAllRead(): void {
  for (const chat of chats.value)
    chat.unread = 0
  api.markAllChatsRead()
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

  const chat = api.createChat(person)
  chats.value.push(chat)
  messages.value[chat.id] = []
  selectChat(chat.id)
}

function sendMessage(text: string): boolean {
  const chat = activeChat.value
  const trimmed = text.trim()
  if (!chat || !trimmed)
    return false

  const message = api.sendMessage(chat.id, trimmed)
  if (!message)
    return false

  if (!messages.value[chat.id])
    messages.value[chat.id] = []
  messages.value[chat.id].push(message)
  chat.lastMessageAt = message.createdAt
  chat.unread = 0
  chat.typingUserId = undefined

  window.setTimeout(() => {
    const stored = messages.value[chat.id]?.find((item) => item.id === message.id)
    if (stored)
      stored.status = 'read'
  }, 900)

  return true
}

function updateProfile(profile: ProfileUpdate): void {
  const updated = api.updateProfile(profile)
  Object.assign(currentUser, updated)
}

export function useMessengerState() {
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
    updateProfile,
  }
}
