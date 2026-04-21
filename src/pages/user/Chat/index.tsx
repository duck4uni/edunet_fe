import React, { useCallback, useEffect, useRef, useState } from 'react';
import ContactList from '../../../components/Chat/ContactList';
import ChatWindow from '../../../components/Chat/ChatWindow';
import AssistantBotPanel from '../../../components/Chat/AssistantBotPanel';
import type { Contact, Message, FriendUser, ChatMessageFromServer } from '../../../models/chat';
import { useGetProfileQuery } from '../../../services/authApi';
import {
  useGetFriendsQuery,
  useLazyGetMessagesQuery,
  useGetUnreadCountsQuery,
  useGetLastMessagesQuery,
  useTogglePinConversationMutation,
  useHideConversationMutation,
} from '../../../services/friendChatApi';
import socketService from '../../../services/socketService';

const SUPPORT_BOT_CONTACT_ID = 'support-bot';
const DESKTOP_BREAKPOINT = 1024;
const SWIPE_START_EDGE_PX = 40;
const SWIPE_BACK_DISTANCE_PX = 90;
const SWIPE_MAX_VERTICAL_DRIFT_PX = 72;

const supportBotContact: Contact = {
  id: SUPPORT_BOT_CONTACT_ID,
  name: 'Trợ lý học tập',
  avatar: 'https://api.dicebear.com/9.x/bottts/svg?seed=AcademixAssistant',
  isOnline: true,
  unreadCount: 0,
  isPinned: true,
  role: 'admin',
};

/** Convert server message to UI message */
const toUIMessage = (msg: ChatMessageFromServer, currentUserId: string): Message => ({
  id: msg.id,
  senderId: msg.senderId === currentUserId ? 'me' : msg.senderId,
  content: msg.content,
  timestamp: msg.createdAt,
  type: (msg.type || 'text') as Message['type'],
  status: msg.isRead ? 'seen' : 'delivered',
});

const ChatPage: React.FC = () => {
  const { data: profileData } = useGetProfileQuery();
  const currentUser = (profileData as any)?.data ?? profileData;
  const currentUserId: string = currentUser?.id ?? '';

  // Friend data
  const { data: friendsRes } = useGetFriendsQuery(undefined, { skip: !currentUserId });
  const { data: unreadRes, refetch: refetchUnread } = useGetUnreadCountsQuery(undefined, { skip: !currentUserId });
  const { data: lastMsgRes } = useGetLastMessagesQuery(undefined, { skip: !currentUserId });

  const friends: FriendUser[] = (friendsRes as any)?.data ?? [];
  const unreadCounts: Record<string, number> = {};
  ((unreadRes as any)?.data ?? []).forEach((u: any) => {
    unreadCounts[u.senderId] = parseInt(u.count);
  });

  const [fetchMessages] = useLazyGetMessagesQuery();
  const [togglePin] = useTogglePinConversationMutation();
  const [hideConversation] = useHideConversationMutation();

  // Local state
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [lastMessages, setLastMessages] = useState<Record<string, Message>>({});
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  // Layout state
  const [panelHeight, setPanelHeight] = useState(640);
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= DESKTOP_BREAKPOINT;
  });
  const [showConversationOnMobile, setShowConversationOnMobile] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchCurrentXRef = useRef<number | null>(null);
  const touchCurrentYRef = useRef<number | null>(null);

  // Build contacts from friends list + chat history partners
  const friendIds = new Set(friends.map((f) => f.id));
  const lastMsgData: any[] = (lastMsgRes as any)?.data ?? [];

  // Build a map of partnerId -> isPinned from server data
  const pinnedMap = new Map<string, boolean>();
  lastMsgData.forEach((msg: any) => {
    if (msg.partner) {
      pinnedMap.set(msg.partner.id, msg.isPinned ?? false);
    }
  });

  const contacts: Contact[] = [
    supportBotContact,
    ...friends.map((f) => ({
      id: f.id,
      name: `${f.firstName || ''} ${f.lastName || ''}`.trim() || f.email,
      avatar: f.avatar || undefined,
      isOnline: onlineUsers.has(f.id),
      unreadCount: unreadCounts[f.id] || 0,
      role: f.role as Contact['role'],
      isPinned: pinnedMap.get(f.id) ?? false,
    })),
    // Add non-friend users who have chat history
    ...lastMsgData
      .filter((msg: any) => msg.partner && !friendIds.has(msg.partner.id))
      .map((msg: any) => {
        const p = msg.partner;
        const name = `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.email;
        return {
          id: p.id,
          name,
          avatar: p.avatar || undefined,
          isOnline: onlineUsers.has(p.id),
          unreadCount: unreadCounts[p.id] || 0,
          role: p.role as Contact['role'],
          isPinned: msg.isPinned ?? false,
        };
      }),
  ];

  // Pre-populate lastMessages from server data
  useEffect(() => {
    if (!currentUserId) return;
    const serverMsgs = (lastMsgRes as any)?.data ?? [];
    if (serverMsgs.length === 0) return;

    setLastMessages((prev) => {
      const next = { ...prev };
      serverMsgs.forEach((msg: any) => {
        const partnerId = msg.senderId === currentUserId ? msg.receiverId : msg.senderId;
        // Only set if not already populated (socket events take precedence)
        if (!next[partnerId]) {
          next[partnerId] = toUIMessage(msg, currentUserId);
        }
      });
      return next;
    });
  }, [lastMsgRes, currentUserId]);

  // Connect socket when user is authenticated
  useEffect(() => {
    if (!currentUserId) return;

    // Socket is connected by Layout — just get the instance
    const socket = socketService.getSocket();
    if (!socket) return;

    const handleMessage = (data: ChatMessageFromServer) => {
      const uiMsg = toUIMessage(data, currentUserId);
      setMessages((prev) => ({
        ...prev,
        [data.senderId]: [...(prev[data.senderId] || []), uiMsg],
      }));
      setLastMessages((prev) => ({ ...prev, [data.senderId]: uiMsg }));
    };

    const handleMessageSent = (data: ChatMessageFromServer) => {
      const uiMsg: Message = {
        id: data.id,
        senderId: 'me',
        content: data.content,
        timestamp: data.createdAt,
        type: (data.type || 'text') as Message['type'],
        status: 'sent',
      };
      setMessages((prev) => {
        const receiverMsgs = prev[data.receiverId] || [];
        const pendingIdx = receiverMsgs.findIndex(
          (m) => m.status === 'sending' && m.content === data.content,
        );
        if (pendingIdx >= 0) {
          const updated = [...receiverMsgs];
          updated[pendingIdx] = uiMsg;
          return { ...prev, [data.receiverId]: updated };
        }
        return { ...prev, [data.receiverId]: [...receiverMsgs, uiMsg] };
      });
      setLastMessages((prev) => ({ ...prev, [data.receiverId]: uiMsg }));
    };

    const handleUserOnline = ({ userId }: { userId: string }) => {
      setOnlineUsers((prev) => new Set(prev).add(userId));
    };

    const handleUserOffline = ({ userId }: { userId: string }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    };

    const handleOnlineStatus = (statuses: { userId: string; isOnline: boolean }[]) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        statuses.forEach(({ userId, isOnline }) => {
          if (isOnline) next.add(userId);
          else next.delete(userId);
        });
        return next;
      });
    };

    const handleMessageRead = ({ readBy }: { readBy: string }) => {
      setMessages((prev) => {
        const updated = { ...prev };
        if (updated[readBy]) {
          updated[readBy] = updated[readBy].map((m) =>
            m.senderId === 'me' ? { ...m, status: 'seen' as const } : m,
          );
        }
        return updated;
      });
    };

    socket.on('message:receive', handleMessage);
    socket.on('message:sent', handleMessageSent);
    socket.on('user:online', handleUserOnline);
    socket.on('user:offline', handleUserOffline);
    socket.on('online:status', handleOnlineStatus);
    socket.on('message:read', handleMessageRead);

    return () => {
      socket.off('message:receive', handleMessage);
      socket.off('message:sent', handleMessageSent);
      socket.off('user:online', handleUserOnline);
      socket.off('user:offline', handleUserOffline);
      socket.off('online:status', handleOnlineStatus);
      socket.off('message:read', handleMessageRead);
    };
  }, [currentUserId]);

  // Check online status of all contacts
  useEffect(() => {
    const contactIds = contacts
      .filter((c) => c.id !== SUPPORT_BOT_CONTACT_ID)
      .map((c) => c.id);
    if (contactIds.length > 0 && socketService.isConnected()) {
      socketService.checkOnlineStatus(contactIds);
    }
  }, [friends, lastMsgRes]);

  // Load messages when selecting a contact
  const loadMessages = useCallback(
    async (friendId: string) => {
      if (!currentUserId || friendId === SUPPORT_BOT_CONTACT_ID) return;
      try {
        const res = await fetchMessages({ friendId }).unwrap();
        const data = (res as any)?.data ?? res;
        const serverMsgs: ChatMessageFromServer[] = data?.messages ?? [];
        const uiMsgs = serverMsgs.map((m) => toUIMessage(m, currentUserId));
        setMessages((prev) => ({ ...prev, [friendId]: uiMsgs }));
        if (uiMsgs.length > 0) {
          setLastMessages((prev) => ({
            ...prev,
            [friendId]: uiMsgs[uiMsgs.length - 1],
          }));
        }
        socketService.markAsRead(friendId);
        refetchUnread();
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    },
    [currentUserId, fetchMessages, refetchUnread],
  );

  // Layout resize
  useEffect(() => {
    const getViewportHeight = () => window.visualViewport?.height ?? window.innerHeight;
    const updateLayoutMetrics = () => {
      const viewportHeight = getViewportHeight();
      const headerHeight = document.querySelector('header')?.getBoundingClientRect().height ?? 0;
      const footerHeight = document.querySelector('footer')?.getBoundingClientRect().height ?? 0;
      const safePadding = window.innerWidth < DESKTOP_BREAKPOINT ? 18 : 36;
      const availableHeight = viewportHeight - headerHeight - footerHeight - safePadding;
      const boundedHeight = Math.max(window.innerWidth < DESKTOP_BREAKPOINT ? 360 : 520, availableHeight);
      setPanelHeight(Math.min(boundedHeight, 900));
      setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT);
    };
    updateLayoutMetrics();
    window.addEventListener('resize', updateLayoutMetrics);
    window.visualViewport?.addEventListener('resize', updateLayoutMetrics);
    window.visualViewport?.addEventListener('scroll', updateLayoutMetrics);
    return () => {
      window.removeEventListener('resize', updateLayoutMetrics);
      window.visualViewport?.removeEventListener('resize', updateLayoutMetrics);
      window.visualViewport?.removeEventListener('scroll', updateLayoutMetrics);
    };
  }, []);

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    if (contact.id !== SUPPORT_BOT_CONTACT_ID) {
      loadMessages(contact.id);
    }
    if (!isDesktop) setShowConversationOnMobile(true);
  };

  const handlePinContact = async (contactId: string) => {
    try {
      await togglePin(contactId).unwrap();
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  };

  const handleDeleteConversation = async (contactId: string) => {
    try {
      await hideConversation(contactId).unwrap();
      if (selectedContact?.id === contactId) {
        setSelectedContact(null);
        if (!isDesktop) setShowConversationOnMobile(false);
      }
      setMessages((prev) => {
        const next = { ...prev };
        delete next[contactId];
        return next;
      });
      setLastMessages((prev) => {
        const next = { ...prev };
        delete next[contactId];
        return next;
      });
    } catch (err) {
      console.error('Failed to hide conversation:', err);
    }
  };

  const handleBackToList = () => setShowConversationOnMobile(false);

  const handleConversationTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (isDesktop || !showConversationOnMobile) return;
    touchStartXRef.current = event.touches[0].clientX;
    touchStartYRef.current = event.touches[0].clientY;
    touchCurrentXRef.current = event.touches[0].clientX;
    touchCurrentYRef.current = event.touches[0].clientY;
  };

  const handleConversationTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (isDesktop || !showConversationOnMobile) return;
    touchCurrentXRef.current = event.touches[0].clientX;
    touchCurrentYRef.current = event.touches[0].clientY;
  };

  const handleConversationTouchEnd = () => {
    if (isDesktop || !showConversationOnMobile) return;
    if (
      touchStartXRef.current === null ||
      touchStartYRef.current === null ||
      touchCurrentXRef.current === null ||
      touchCurrentYRef.current === null
    ) return;
    const deltaX = touchCurrentXRef.current - touchStartXRef.current;
    const deltaY = Math.abs(touchCurrentYRef.current - touchStartYRef.current);
    const startedFromEdge = touchStartXRef.current <= SWIPE_START_EDGE_PX;
    if (startedFromEdge && deltaX >= SWIPE_BACK_DISTANCE_PX && deltaY <= SWIPE_MAX_VERTICAL_DRIFT_PX) {
      handleBackToList();
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    touchCurrentXRef.current = null;
    touchCurrentYRef.current = null;
  };

  const handleSendMessage = (content: string, type: string = 'text') => {
    if (!selectedContact || selectedContact.id === SUPPORT_BOT_CONTACT_ID) return;

    const optimistic: Message = {
      id: `sending-${Date.now()}`,
      senderId: 'me',
      content,
      timestamp: new Date().toISOString(),
      type: type as Message['type'],
      status: 'sending',
    };

    setMessages((prev) => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] || []), optimistic],
    }));

    socketService.sendMessage(selectedContact.id, content, type);
  };

  const handleReaction = (messageId: string, reaction: string) => {
    if (!selectedContact) return;
    setMessages((prev) => ({
      ...prev,
      [selectedContact.id]: (prev[selectedContact.id] || []).map((msg) =>
        msg.id === messageId
          ? { ...msg, reactions: [...(msg.reactions || []), reaction] }
          : msg,
      ),
    }));
  };

  const currentMessages = selectedContact ? messages[selectedContact.id] || [] : [];
  const isSupportBotSelected = selectedContact?.id === SUPPORT_BOT_CONTACT_ID;

  const showContactPanel = isDesktop || !showConversationOnMobile;
  const showConversationPanel = isDesktop || showConversationOnMobile;
  const shouldRenderContactPanel = isDesktop ? showContactPanel : true;
  const shouldRenderConversationPanel = isDesktop ? showConversationPanel : true;

  return (
    <div className="bg-gradient-to-br from-[#f3fbff] via-[#eef8ff] to-[#e8f6ff] px-3 py-3 md:px-5 md:py-5">
      <div className="mx-auto w-full max-w-[1500px]">

        <section
          className="overflow-hidden rounded-3xl border border-[#d5ebf8] bg-white shadow-[0_20px_45px_-28px_rgba(1,38,67,0.35)]"
          style={{ height: `${panelHeight}px` }}
        >
          <div className={`${isDesktop ? 'flex' : 'relative'} h-full min-h-0 overflow-hidden`}>
            <aside
              className={`${shouldRenderContactPanel ? 'flex' : 'hidden'} ${isDesktop ? 'w-[360px] border-r border-[#d5ebf8]' : 'absolute inset-0 w-full transition-all duration-300 ease-out'} ${!isDesktop && showConversationOnMobile ? '-translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'} min-h-0 flex-col bg-[#f8fdff]`}
            >
              <ContactList
                contacts={contacts}
                selectedContact={selectedContact}
                onSelectContact={handleSelectContact}
                lastMessages={lastMessages}
                onPinContact={handlePinContact}
                onDeleteConversation={handleDeleteConversation}
              />
            </aside>

            <main
              className={`${shouldRenderConversationPanel ? 'flex' : 'hidden'} ${isDesktop ? 'relative flex-1' : 'absolute inset-0 w-full transition-all duration-300 ease-out'} ${!isDesktop && !showConversationOnMobile ? 'translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'} min-h-0 min-w-0 flex-col bg-white`}
              onTouchStart={handleConversationTouchStart}
              onTouchMove={handleConversationTouchMove}
              onTouchEnd={handleConversationTouchEnd}
            >
              {isSupportBotSelected ? (
                <AssistantBotPanel onBack={!isDesktop ? handleBackToList : undefined} />
              ) : (
                <ChatWindow
                  contact={selectedContact}
                  messages={currentMessages}
                  onSendMessage={handleSendMessage}
                  onReaction={handleReaction}
                  onBack={!isDesktop ? handleBackToList : undefined}
                />
              )}
            </main>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ChatPage;
