<script setup lang="ts">
import {computed, nextTick, ref, watch} from 'vue'

import Icon from './Icon.vue'
import {formatDateLabel, formatTime} from '@/utils/format'
import type {Message} from '@/types/messenger'
import {useMessengerState} from '@/useMessengerState'

const {
  activeChat,
  activeContact,
  activeMessages,
  activeTypingUser,
  presenceLabel,
  introText,
  senderNameFor,
  isMine,
  sendMessage,
  backToList,
} = useMessengerState()

const draft = ref('')
const scroller = ref<HTMLElement | null>(null)
const composer = ref<HTMLTextAreaElement | null>(null)
const atBottom = ref(true)

interface MessageGroupItem {
  message: Message
  compact: boolean
}

interface MessageGroup {
  label: string
  items: MessageGroupItem[]
}

const statusText = computed<string>(() => {
  if (activeTypingUser.value)
    return `${activeTypingUser.value.name.split(' ')[0]} is typing…`
  return presenceLabel.value
})

const messageGroups = computed<MessageGroup[]>(() => {
  const list = activeMessages.value
  const groups: MessageGroup[] = []
  let currentLabel: string | null = null

  for (let index = 0; index < list.length; index += 1) {
    const item = list[index]
    const label = formatDateLabel(item.createdAt)

    if (label !== currentLabel) {
      groups.push({label, items: []})
      currentLabel = label
    }

    const previous = list[index - 1]
    const sameDay = previous && formatDateLabel(previous.createdAt) === label
    const startsBlock = !previous
        || previous.senderId !== item.senderId
        || item.createdAt - previous.createdAt > 5 * 60_000
        || !sameDay

    groups[groups.length - 1].items.push({
      message: item,
      compact: !startsBlock,
    })
  }

  return groups
})

function scrollToBottom(smooth = false): void {
  nextTick(() => {
    if (!scroller.value)
      return
    scroller.value.scrollTo({
      top: scroller.value.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    })
  })
}

function onScroll(): void {
  const element = scroller.value
  if (!element)
    return
  atBottom.value = element.scrollHeight - element.scrollTop - element.clientHeight < 80
}

function resize(): void {
  const element = composer.value
  if (!element)
    return
  element.style.height = 'auto'
  element.style.height = `${Math.min(element.scrollHeight, 160)}px`
}

function submit(): void {
  if (!draft.value.trim())
    return
  if (sendMessage(draft.value)) {
    draft.value = ''
    atBottom.value = true
    nextTick(() => {
      resize()
      scrollToBottom(true)
    })
  }
}

watch(() => activeChat.value?.id, (chatId) => {
  draft.value = ''
  atBottom.value = true
  nextTick(() => {
    resize()
    scrollToBottom(false)
    if (chatId)
      composer.value?.focus()
  })
}, {immediate: true})

watch(() => activeMessages.value.length, () => {
  if (atBottom.value)
    scrollToBottom(true)
})
</script>

<template>
  <section class="chat-view">
    <template v-if="activeChat">
      <header class="chat-head">
        <button class="mobile-back" title="Back to conversations" type="button" @click="backToList">
          <Icon name="arrow-left" :size="18"/>
        </button>

        <div class="chat-heading">
          <h1>
            {{ activeChat.title }}
          </h1>
          <p :class="['chat-status', {'is-typing': activeTypingUser}]">
            <span v-if="!activeTypingUser" :class="['status-dot', {online: activeContact?.online}]"></span>
            {{ statusText }}
          </p>
        </div>
      </header>

      <div ref="scroller" class="messages" @scroll="onScroll">
        <div class="messages-inner">
          <div class="conversation-intro">
            <span class="intro-mark">
              <Icon name="user" :size="22"/>
            </span>
            <h2>{{ activeChat.title }}</h2>
            <p>{{ introText }}</p>
          </div>

          <div v-for="group in messageGroups" :key="group.label" class="day-group">
            <div class="day-label"><span>{{ group.label }}</span></div>

            <div
                v-for="item in group.items"
                :key="item.message.id"
                :class="[
                  'message-row',
                  {'is-mine': isMine(item.message), 'is-compact': item.compact},
                ]"
            >
              <div class="message-stack">
                <div class="bubble">
                  <div v-if="item.message.replyTo" class="reply-quote">
                    <strong>{{ senderNameFor(item.message.replyTo.senderId) }}</strong>
                    <span>{{ item.message.replyTo.text }}</span>
                  </div>

                  <p class="text">{{ item.message.text }}</p>

                  <div class="meta">
                    <span>{{ formatTime(item.message.createdAt) }}</span>
                    <Icon
                        v-if="isMine(item.message)"
                        :class="['ticks', {read: item.message.status === 'read'}]"
                        name="check-double"
                        :size="14"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="!activeMessages.length" class="empty-thread">
            <p>No messages yet. Say hello.</p>
          </div>
        </div>
      </div>

      <div class="composer-wrap">
        <form class="composer" @submit.prevent="submit">
          <textarea
              ref="composer"
              v-model="draft"
              :placeholder="`Message ${activeChat.title}`"
              rows="1"
              @input="resize"
              @keydown.enter.exact.prevent="submit"
          />
          <div class="composer-tools">
            <button class="send" :disabled="!draft.trim()" title="Send" type="submit">
              <Icon name="send" :size="17"/>
            </button>
          </div>
        </form>
        <p class="composer-hint">Enter to send · Shift + Enter for a new line</p>
      </div>
    </template>

    <div v-else class="no-chat">
      <span class="no-chat-mark"><Icon name="message" :size="26"/></span>
      <h2>Pick a conversation</h2>
      <p>Choose a chat from the sidebar to start reading and writing.</p>
    </div>
  </section>
</template>

<style scoped>
.chat-view {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  background: var(--panel);
}

.chat-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--panel);
  flex: 0 0 auto;
}

.chat-heading {
  flex: 1;
  min-width: 0;
}

.chat-heading h1 {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0;
  font-size: 14.5px;
  font-weight: 700;
  letter-spacing: 0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-status {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 15px;
  margin: 2px 0 0;
  color: var(--muted);
  font-size: 11.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-status.is-typing {
  color: var(--text);
  font-style: italic;
}

.status-dot {
  width: 5px;
  height: 5px;
  flex: 0 0 auto;
  background: var(--border-strong);
}

.status-dot.online {
  background: var(--text);
}

.mobile-back {
  display: none;
  place-items: center;
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  color: var(--muted);
}

.mobile-back:hover {
  background: var(--surface);
  color: var(--text);
}

.messages {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 22px 22px 14px;
  scroll-behavior: smooth;
}

.messages-inner {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 860px;
  min-height: 100%;
  margin: 0 auto;
}

.conversation-intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  max-width: 520px;
  margin: 10px auto 30px;
  padding: 22px;
  border: 1px solid var(--border);
  background: var(--surface);
  text-align: center;
}

.intro-mark,
.no-chat-mark {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  margin-bottom: 2px;
  border: 1px solid var(--border);
  background: var(--panel);
  color: var(--muted);
}

.conversation-intro h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.conversation-intro p {
  margin: 0;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.55;
}

.day-group {
  display: flex;
  flex-direction: column;
}

.day-label {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0 14px;
  color: var(--muted);
  font-size: 10px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.day-label::before,
.day-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

.message-row {
  display: flex;
  justify-content: flex-start;
  margin-top: 12px;
}

.message-row.is-compact {
  margin-top: 2px;
}

.message-row.is-mine {
  justify-content: flex-end;
}

.message-stack {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 68%;
  min-width: 0;
}

.message-row.is-mine .message-stack {
  align-items: flex-end;
}

.bubble {
  max-width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--border);
  background: var(--bubble-in);
  color: var(--bubble-in-text);
}

.message-row.is-mine .bubble {
  border-color: transparent;
  background: var(--bubble-out);
  color: var(--bubble-out-text);
}

.text {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.5;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.reply-quote {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin-bottom: 7px;
  padding-left: 8px;
  border-left: 2px solid currentColor;
  opacity: 0.72;
}

.reply-quote strong {
  font-size: 10.5px;
  font-weight: 700;
}

.reply-quote span {
  font-size: 11.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 4px;
  font-size: 9.5px;
  letter-spacing: 0.01em;
  opacity: 0.62;
}

.ticks {
  color: currentColor;
}

.ticks.read {
  opacity: 1;
}

.empty-thread {
  display: grid;
  place-items: center;
  flex: 1;
  min-height: 120px;
  color: var(--muted);
  font-size: 12px;
}

.composer-wrap {
  flex: 0 0 auto;
  padding: 12px 22px 14px;
  border-top: 1px solid var(--border);
}

.composer {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  width: 100%;
  max-width: 860px;
  margin: 0 auto;
  padding: 7px 8px 7px 12px;
  border: 1px solid var(--border-strong);
  background: var(--panel);
}

.composer:focus-within {
  border-color: var(--text);
}

.composer textarea {
  flex: 1;
  min-width: 0;
  min-height: 26px;
  max-height: 160px;
  padding: 4px 2px;
  border: 0;
  outline: 0;
  resize: none;
  background: transparent;
  color: var(--text);
  font-size: 13.5px;
  line-height: 1.45;
}

.composer textarea::placeholder {
  color: var(--muted);
}

.composer-tools {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 0 0 auto;
}

.composer-tools button {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  color: var(--muted);
  transition: background 0.15s ease, color 0.15s ease;
}

.composer-tools button:hover {
  background: var(--surface);
  color: var(--text);
}

.composer-tools .send {
  margin-left: 2px;
  background: var(--text);
  color: var(--panel);
}

.composer-tools .send:hover {
  background: var(--text);
  color: var(--panel);
  opacity: 0.86;
}

.composer-tools .send:disabled {
  opacity: 0.32;
}

.composer-hint {
  max-width: 860px;
  margin: 6px auto 0;
  color: var(--muted);
  font-size: 10px;
  text-align: center;
}

.no-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  text-align: center;
}

.no-chat h2 {
  margin: 2px 0 0;
  font-size: 16px;
}

.no-chat p {
  max-width: 340px;
  margin: 0;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.55;
}

@media (max-width: 720px) {
  .mobile-back {
    display: grid;
  }

  .messages {
    padding: 16px 14px 10px;
  }

  .message-stack {
    max-width: 84%;
  }

  .chat-head,
  .composer-wrap {
    padding-right: 14px;
    padding-left: 14px;
  }
}
</style>
