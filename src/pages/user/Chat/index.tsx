import React, { useState } from 'react';
import ContactList from '../../../components/Chat/ContactList';
import ChatWindow from '../../../components/Chat/ChatWindow';
import SupportBotPanel from '../../../components/Chat/SupportBotPanel';
import type { Contact, Message } from '../../../models/chat';

const SUPPORT_BOT_CONTACT_ID = 'support-bot';

const supportBotContact: Contact = {
  id: SUPPORT_BOT_CONTACT_ID,
  name: 'Tro ly ho tro EduNet',
  avatar: 'https://api.dicebear.com/9.x/bottts/svg?seed=EduNetSupport',
  isOnline: true,
  unreadCount: 0,
  isPinned: true,
  role: 'admin',
};

// Mock data for demonstration
const mockContacts: Contact[] = [
  supportBotContact,
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    isOnline: true,
    isVerified: true,
    isPinned: true,
    unreadCount: 3,
    role: 'teacher',
  },
  {
    id: '2',
    name: 'Michael Chen',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    isOnline: true,
    unreadCount: 0,
    role: 'student',
  },
  {
    id: '3',
    name: 'React Study Group',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100',
    isOnline: false,
    isGroup: true,
    memberCount: 12,
    unreadCount: 5,
    isPinned: true,
  },
  {
    id: '4',
    name: 'Emily Davis',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    isOnline: false,
    lastSeen: '2 hours ago',
    unreadCount: 0,
    isMuted: true,
    role: 'student',
  },
  {
    id: '5',
    name: 'Prof. David Wilson',
    avatar: 'https://randomuser.me/api/portraits/men/52.jpg',
    isOnline: true,
    isVerified: true,
    unreadCount: 1,
    role: 'teacher',
  },
  {
    id: '6',
    name: 'JavaScript Masters',
    avatar: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=100',
    isOnline: false,
    isGroup: true,
    memberCount: 45,
    unreadCount: 0,
  },
  {
    id: '7',
    name: 'Alex Thompson',
    avatar: 'https://randomuser.me/api/portraits/men/86.jpg',
    isOnline: false,
    lastSeen: '5 mins ago',
    unreadCount: 0,
    role: 'student',
  },
  {
    id: '8',
    name: 'Lisa Park',
    avatar: 'https://randomuser.me/api/portraits/women/79.jpg',
    isOnline: true,
    unreadCount: 2,
    role: 'student',
  },
];

const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: '1-1',
      senderId: '1',
      content: 'Hi! How are you doing with the React course?',
      timestamp: '2024-01-15T09:00:00Z',
      type: 'text',
      status: 'seen',
    },
    {
      id: '1-2',
      senderId: 'me',
      content: 'Hello! I\'m doing great, just finished the hooks section!',
      timestamp: '2024-01-15T09:05:00Z',
      type: 'text',
      status: 'seen',
    },
    {
      id: '1-3',
      senderId: '1',
      content: 'That\'s wonderful! The hooks section is really important. Did you have any questions about useEffect?',
      timestamp: '2024-01-15T09:10:00Z',
      type: 'text',
      status: 'seen',
    },
    {
      id: '1-4',
      senderId: 'me',
      content: 'Actually yes! I\'m a bit confused about the dependency array. When should I use an empty array vs including dependencies?',
      timestamp: '2024-01-15T09:15:00Z',
      type: 'text',
      status: 'seen',
    },
    {
      id: '1-5',
      senderId: '1',
      content: 'Great question! An empty array [] means the effect runs only once on mount. When you include dependencies, the effect re-runs whenever those values change. I\'ll send you some examples.',
      timestamp: '2024-01-15T09:20:00Z',
      type: 'text',
      status: 'delivered',
      reactions: ['👍', '❤️'],
    },
    {
      id: '1-6',
      senderId: '1',
      content: 'Here\'s a helpful diagram I created for my students',
      timestamp: '2024-01-15T09:22:00Z',
      type: 'image',
      imageUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400',
      status: 'delivered',
    },
    {
      id: '1-7',
      senderId: 'me',
      content: 'This is so helpful! Thank you so much! 🙏',
      timestamp: '2024-01-15T09:25:00Z',
      type: 'text',
      status: 'sent',
      reactions: ['❤️'],
    },
  ],
  '2': [
    {
      id: '2-1',
      senderId: 'me',
      content: 'Hey Michael, want to study together for the exam?',
      timestamp: '2024-01-14T15:00:00Z',
      type: 'text',
      status: 'seen',
    },
    {
      id: '2-2',
      senderId: '2',
      content: 'Sure! When are you free?',
      timestamp: '2024-01-14T15:30:00Z',
      type: 'text',
      status: 'seen',
    },
    {
      id: '2-3',
      senderId: 'me',
      content: 'How about tomorrow at 2pm?',
      timestamp: '2024-01-14T15:35:00Z',
      type: 'text',
      status: 'seen',
    },
    {
      id: '2-4',
      senderId: '2',
      content: 'Perfect! Let\'s meet at the library 📚',
      timestamp: '2024-01-14T15:40:00Z',
      type: 'text',
      status: 'seen',
    },
  ],
  '3': [
    {
      id: '3-1',
      senderId: '7',
      content: 'Anyone finished the Redux assignment?',
      timestamp: '2024-01-15T08:00:00Z',
      type: 'text',
    },
    {
      id: '3-2',
      senderId: '8',
      content: 'I\'m still working on it. The middleware part is tricky!',
      timestamp: '2024-01-15T08:10:00Z',
      type: 'text',
    },
    {
      id: '3-3',
      senderId: 'me',
      content: 'I can help! I just finished it. The key is understanding the flow of actions.',
      timestamp: '2024-01-15T08:15:00Z',
      type: 'text',
      status: 'seen',
      reactions: ['🔥', '👍'],
    },
    {
      id: '3-4',
      senderId: '2',
      content: 'That would be awesome! Can you share your approach?',
      timestamp: '2024-01-15T08:20:00Z',
      type: 'text',
    },
  ],
  '5': [
    {
      id: '5-1',
      senderId: '5',
      content: 'Don\'t forget to submit your project by Friday!',
      timestamp: '2024-01-15T10:00:00Z',
      type: 'text',
      status: 'delivered',
    },
  ],
};

// Generate last messages for contact list
const getLastMessages = (): Record<string, Message> => {
  const lastMessages: Record<string, Message> = {};
  Object.keys(mockMessages).forEach(contactId => {
    const messages = mockMessages[contactId];
    if (messages.length > 0) {
      lastMessages[contactId] = messages[messages.length - 1];
    }
  });
  return lastMessages;
};

const ChatPage: React.FC = () => {
  const [contacts] = useState<Contact[]>(mockContacts);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);
  const [lastMessages] = useState(getLastMessages());

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    // Mark as read
  };

  const handleSendMessage = (content: string, type: string = 'text') => {
    if (!selectedContact) return;

    const newMessage: Message = {
      id: `new-${Date.now()}`,
      senderId: 'me',
      content,
      timestamp: new Date().toISOString(),
      type: type as 'text',
      status: 'sending',
    };

    setMessages(prev => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] || []), newMessage],
    }));

    // Simulate message sent
    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [selectedContact.id]: prev[selectedContact.id].map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        ),
      }));
    }, 500);

    // Simulate message delivered
    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [selectedContact.id]: prev[selectedContact.id].map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        ),
      }));
    }, 1000);
  };

  const handleReaction = (messageId: string, reaction: string) => {
    if (!selectedContact) return;

    setMessages(prev => ({
      ...prev,
      [selectedContact.id]: prev[selectedContact.id].map(msg =>
        msg.id === messageId
          ? { ...msg, reactions: [...(msg.reactions || []), reaction] }
          : msg
      ),
    }));
  };

  const currentMessages = selectedContact ? messages[selectedContact.id] || [] : [];
  const isSupportBotSelected = selectedContact?.id === SUPPORT_BOT_CONTACT_ID;

  return (
    <div className="h-[calc(100vh-80px)] flex bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      {/* Contact List - Left Side */}
      <div className="w-[360px] border-r border-gray-100 flex-shrink-0">
        <ContactList
          contacts={contacts}
          selectedContact={selectedContact}
          onSelectContact={handleSelectContact}
          lastMessages={lastMessages}
        />
      </div>

      {/* Chat Window - Right Side */}
      <div className="flex-1 min-w-0">
        {isSupportBotSelected ? (
          <SupportBotPanel />
        ) : (
          <ChatWindow
            contact={selectedContact}
            messages={currentMessages}
            onSendMessage={handleSendMessage}
            onReaction={handleReaction}
          />
        )}
      </div>
    </div>
  );
};

export default ChatPage;
