<script setup lang="ts">
import {computed, ref} from 'vue'

import Icon from './Icon.vue'
import {formatChatTime} from '@/utils/format'
import type {Chat} from '@/types/messenger'
import {useMessengerState} from '@/useMessengerState'

const {
  currentUser,
  filter,
  search,
  filters,
  sortedChats,
  totalUnread,
  newChatOpen,
  availablePeople,
  activeChatId,
  lastMessageOf,
  isTyping,
  previewFor,
  setFilter,
  selectChat,
  markAllRead,
  toggleNewChat,
  startChat,
  updateProfile,
} = useMessengerState()

const profileOpen = ref(false)
const nameDraft = ref('')
const handleDraft = ref('')

const canSaveProfile = computed<boolean>(() => (
  nameDraft.value.trim().length > 0
  && handleDraft.value.trim().replace(/^@+/, '').length > 0
))

function chatTime(chat: Chat): string {
  const last = lastMessageOf(chat.id)
  return formatChatTime(last?.createdAt ?? chat.lastMessageAt)
}

function toggleProfile(): void {
  profileOpen.value = !profileOpen.value
  if (profileOpen.value) {
    nameDraft.value = currentUser.name
    handleDraft.value = currentUser.handle
    newChatOpen.value = false
  }
}

function closeProfile(): void {
  profileOpen.value = false
}

function openNewChat(): void {
  profileOpen.value = false
  toggleNewChat()
}

function saveProfile(): void {
  if (!canSaveProfile.value)
    return

  updateProfile({
    name: nameDraft.value.trim(),
    handle: `@${handleDraft.value.trim().replace(/^@+/, '')}`,
  })
  profileOpen.value = false
}
</script>

<template>
  <div class="sidebar">
    <header class="sidebar-head">
      <button class="profile" title="Edit profile" type="button" @click="toggleProfile">
        <span class="profile-text">
          <strong>{{ currentUser.name }}</strong>
          <span>{{ currentUser.handle }}</span>
        </span>
        <Icon class="profile-cog" name="settings" :size="16"/>
      </button>

      <button class="new-chat" title="New chat" type="button" @click="openNewChat">
        <Icon name="plus" :size="18"/>
      </button>
    </header>

    <div class="search-row">
      <Icon name="search" :size="16"/>
      <input v-model="search" placeholder="Search messages" type="text"/>
      <button v-if="search" class="clear" title="Clear search" type="button" @click="search = ''">
        <Icon name="close" :size="14"/>
      </button>
    </div>

    <div class="filters">
      <button
          v-for="item in filters"
          :key="item.id"
          :class="['filter', {active: filter === item.id}]"
          type="button"
          @click="setFilter(item.id)"
      >
        {{ item.label }}
        <span v-if="item.count" class="filter-count">{{ item.count }}</span>
      </button>

      <button
          v-if="totalUnread"
          class="read-all"
          title="Mark all as read"
          type="button"
          @click="markAllRead"
      >
        <Icon name="check-double" :size="15"/>
      </button>
    </div>

    <div v-if="sortedChats.length" class="chat-list">
      <button
          v-for="chat in sortedChats"
          :key="chat.id"
          :class="['chat-item', {active: chat.id === activeChatId}]"
          type="button"
          @click="selectChat(chat.id)"
      >
        <span class="chat-body">
          <span class="chat-top">
            <span class="chat-title">
              {{ chat.title }}
            </span>
            <span class="chat-time">{{ chatTime(chat) }}</span>
          </span>

          <span class="chat-bottom">
            <span :class="['chat-preview', {'is-typing': isTyping(chat)}]">
              {{ previewFor(chat) }}
            </span>
            <span class="chat-flags">
              <span v-if="chat.unread" class="unread">{{ chat.unread > 99 ? '99+' : chat.unread }}</span>
            </span>
          </span>
        </span>
      </button>
    </div>

    <div v-else class="empty-list">
      <Icon :name="filter === 'unread' ? 'check-double' : 'message'" :size="28"/>
      <p v-if="search">No conversations match “{{ search }}”.</p>
      <p v-else-if="filter === 'unread'">You are all caught up.</p>
      <p v-else>No conversations yet.</p>
    </div>

    <Transition name="popover">
      <div v-if="profileOpen" class="profile-popover">
        <div class="popover-head">
          <span>Your profile</span>
          <button class="clear" title="Close" type="button" @click="closeProfile">
            <Icon name="close" :size="14"/>
          </button>
        </div>

        <label class="field">
          <span>Name</span>
          <input
              v-model="nameDraft"
              maxlength="48"
              placeholder="Your name"
              type="text"
              @keydown.enter.prevent="saveProfile"
          />
        </label>

        <label class="field">
          <span>Username</span>
          <input
              v-model="handleDraft"
              maxlength="32"
              placeholder="@username"
              type="text"
              @keydown.enter.prevent="saveProfile"
          />
        </label>

        <div class="id-field">
          <span>Your ID</span>
          <code>{{ currentUser.id }}</code>
        </div>

        <button class="save-profile" :disabled="!canSaveProfile" type="button" @click="saveProfile">
          Save changes
        </button>
      </div>
    </Transition>

    <Transition name="popover">
      <div v-if="newChatOpen" class="new-chat-popover">
        <div class="popover-head">
          <span>Start a conversation</span>
          <button class="clear" title="Close" type="button" @click="toggleNewChat">
            <Icon name="close" :size="14"/>
          </button>
        </div>
        <button
            v-for="person in availablePeople"
            :key="person.id"
            class="contact-row"
            type="button"
            @click="startChat(person)"
        >
          <span class="contact-text">
            <strong>{{ person.name }}</strong>
            <span>{{ person.online ? 'Online' : person.handle }}</span>
          </span>
          <Icon name="message" :size="15"/>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.sidebar {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  background: var(--panel);
}

.sidebar-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 14px 10px;
  flex: 0 0 auto;
}

.profile {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
  padding: 4px;
  margin: -4px;
  text-align: left;
  transition: background 0.15s ease;
}

.profile:hover {
  background: var(--surface);
}

.profile-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  flex: 1;
}

.profile-cog {
  flex: 0 0 auto;
  color: var(--muted);
}

.profile-text strong {
  font-size: 13.5px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-text span {
  font-size: 11.5px;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.new-chat {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  transition: background 0.15s ease, border-color 0.15s ease;
}

.new-chat:hover {
  background: var(--surface-hover);
  border-color: var(--border-strong);
}

.search-row {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 14px 10px;
  padding: 8px 10px;
  border: 1px solid var(--border);
  background: var(--panel);
  color: var(--muted);
  transition: border-color 0.15s ease;
  flex: 0 0 auto;
}

.search-row:focus-within {
  border-color: var(--border-strong);
}

.search-row input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text);
  font-size: 12.5px;
}

.search-row input::placeholder {
  color: var(--muted);
}

.clear {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  color: var(--muted);
}

.clear:hover {
  color: var(--text);
}

.filters {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 14px;
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
  scrollbar-width: none;
  flex: 0 0 auto;
}

.filters::-webkit-scrollbar {
  display: none;
}

.filter {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 0 7px;
  border-bottom: 1px solid transparent;
  color: var(--muted);
  font-size: 10.5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
  transition: color 0.15s ease, border-color 0.15s ease;
}

.filter:hover {
  color: var(--text);
}

.filter.active {
  color: var(--text);
  border-bottom-color: var(--text);
}

.filter-count {
  display: inline-grid;
  place-items: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: var(--text);
  color: var(--panel);
  font-size: 9.5px;
  letter-spacing: 0;
}

.read-all {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  margin-left: auto;
  color: var(--muted);
  flex: 0 0 auto;
}

.read-all:hover {
  color: var(--text);
}

.chat-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.chat-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 11px 14px;
  border-bottom: 1px solid var(--border);
  border-left: 2px solid transparent;
  text-align: left;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.chat-item:hover {
  background: var(--surface);
}

.chat-item.active {
  background: var(--surface);
  border-left-color: var(--text);
}

.chat-body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;
}

.chat-top,
.chat-bottom {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-time {
  flex: 0 0 auto;
  font-size: 10px;
  color: var(--muted);
}

.chat-preview {
  flex: 1;
  min-width: 0;
  font-size: 11.8px;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-preview.is-typing {
  color: var(--text);
  font-style: italic;
}

.chat-flags {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
}

.unread {
  display: inline-grid;
  place-items: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: var(--text);
  color: var(--panel);
  font-size: 9.5px;
  font-weight: 700;
}

.empty-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 24px;
  color: var(--muted);
  text-align: center;
}

.empty-list p {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
}

.new-chat-popover,
.profile-popover {
  position: absolute;
  top: 58px;
  left: 14px;
  right: 14px;
  z-index: 20;
  padding: 8px;
  border: 1px solid var(--border-strong);
  background: var(--panel);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 9px 4px 0;
}

.field > span,
.id-field > span {
  color: var(--muted);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.field input {
  width: 100%;
  padding: 7px 8px;
  border: 1px solid var(--border);
  outline: 0;
  background: var(--panel);
  color: var(--text);
  font-size: 12.5px;
}

.field input:focus {
  border-color: var(--border-strong);
}

.id-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 4px 8px;
}

.id-field code {
  display: block;
  padding: 7px 8px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--muted);
  font-size: 10.5px;
  line-height: 1.5;
  overflow-wrap: anywhere;
  user-select: all;
}

.save-profile {
  width: calc(100% - 8px);
  margin: 4px;
  padding: 8px;
  background: var(--text);
  color: var(--panel);
  font-size: 12px;
  font-weight: 600;
  transition: opacity 0.15s ease;
}

.save-profile:hover:not(:disabled) {
  opacity: 0.86;
}

.save-profile:disabled {
  opacity: 0.35;
}

.popover-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 4px 4px 8px;
  border-bottom: 1px solid var(--border);
  color: var(--muted);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.contact-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 4px;
  text-align: left;
}

.contact-row:hover {
  background: var(--surface);
}

.contact-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  flex: 1;
}

.contact-text strong {
  font-size: 12.5px;
  font-weight: 600;
}

.contact-text span {
  font-size: 11px;
  color: var(--muted);
}

.contact-row > svg {
  color: var(--muted);
}

.popover-enter-active,
.popover-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}

.popover-enter-from,
.popover-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
