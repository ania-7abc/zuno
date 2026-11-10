import type {Chat, Message, MessageMap, PeopleMap} from '@/types/messenger'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export interface MessengerMock {
  people: PeopleMap
  chats: Chat[]
  messages: MessageMap
}

export function createMessengerMock(): MessengerMock {
  const now = Date.now()
  const ago = (offset: number): number => now - offset

  const people: PeopleMap = {
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
  }

  let messageSequence = 0

  const message = (
      senderId: string,
      createdAt: number,
      text: string,
      extra: Partial<Message> = {},
  ): Message => ({
    id: `demo-message-${++messageSequence}`,
    senderId,
    text,
    createdAt,
    status: 'read',
    ...extra,
  })

  const chats: Chat[] = [
    {
      id: 'maya',
      title: 'Maya Collins',
      contactId: 'maya',
      unread: 2,
      lastMessageAt: ago(2 * MINUTE),
      typingUserId: 'maya',
    },
    {
      id: 'daniel',
      title: 'Daniel Reed',
      contactId: 'daniel',
      unread: 0,
      lastMessageAt: ago(1 * HOUR),
    },
    {
      id: 'priya',
      title: 'Priya Shah',
      contactId: 'priya',
      unread: 1,
      lastMessageAt: ago(26 * HOUR),
    },
    {
      id: 'nina',
      title: 'Nina Park',
      contactId: 'nina',
      unread: 0,
      lastMessageAt: ago(27 * HOUR),
    },
    {
      id: 'omar',
      title: 'Omar Haddad',
      contactId: 'omar',
      unread: 0,
      lastMessageAt: ago(3 * DAY),
    },
  ]

  const messages: MessageMap = {
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
  }

  return {people, chats, messages}
}
