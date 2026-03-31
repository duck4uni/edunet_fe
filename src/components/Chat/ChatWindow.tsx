import React, { useState, useRef, useEffect } from 'react';
import { 
  Input, 
  Avatar, 
  Button, 
  Typography, 
  Dropdown, 
  Tooltip,
  Image,
  Popover
} from 'antd';
import { 
  SendOutlined, 
  SmileOutlined, 
  PictureOutlined, 
  PaperClipOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  InfoCircleOutlined,
  MoreOutlined,
  LikeOutlined,
  HeartFilled,
  SmileFilled,
  FireFilled,
  CheckCircleFilled,
  CheckOutlined,
  DoubleRightOutlined,
  GifOutlined,
  AudioOutlined
} from '@ant-design/icons';
import type { Contact, Message } from '../../models/chat';

const { Text } = Typography;
const { TextArea } = Input;

interface ChatWindowProps {
  contact: Contact | null;
  messages: Message[];
  onSendMessage: (content: string, type?: string) => void;
  onReaction: (messageId: string, reaction: string) => void;
}

const REACTIONS = [
  { emoji: '❤️', icon: <HeartFilled className="text-red-500" /> },
  { emoji: '😂', icon: <SmileFilled className="text-yellow-500" /> },
  { emoji: '😮', icon: '😮' },
  { emoji: '😢', icon: '😢' },
  { emoji: '😠', icon: '😠' },
  { emoji: '👍', icon: <LikeOutlined className="text-blue-500" /> },
  { emoji: '🔥', icon: <FireFilled className="text-orange-500" /> },
];

const EMOJI_LIST = ['😀', '😂', '😍', '🥰', '😊', '😎', '🤔', '😅', '😭', '🥺', '😴', '🤗', '👋', '👍', '👎', '👏', '🙏', '💪', '❤️', '💔', '🔥', '⭐', '🎉', '🎊'];

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  contact, 
  messages, 
  onSendMessage,
  onReaction 
}) => {
  const [inputText, setInputText] = useState('');
  const [isTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('vi-VN', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hôm nay';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua';
    }
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const shouldShowDateSeparator = (currentMsg: Message, prevMsg?: Message) => {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.timestamp).toDateString();
    const prevDate = new Date(prevMsg.timestamp).toDateString();
    return currentDate !== prevDate;
  };

  const emojiPopover = (
    <div className="grid grid-cols-6 gap-2 p-2 max-w-[200px]">
      {EMOJI_LIST.map(emoji => (
        <button 
          key={emoji}
          className="text-xl hover:scale-125 transition-transform p-1"
          onClick={() => setInputText(prev => prev + emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  );

  if (!contact) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-[#012643] to-[#17EAD9] rounded-full mx-auto mb-6 flex items-center justify-center">
            <SendOutlined className="text-white text-5xl" />
          </div>
          <Text className="text-2xl font-semibold text-[#012643] block mb-2">
            Chọn một cuộc hội thoại
          </Text>
          <Text className="text-gray-500">
            Chọn từ các cuộc hội thoại hiện có hoặc bắt đầu cuộc trò chuyện mới
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar src={contact.avatar} size={48}>
              {contact.name[0]}
            </Avatar>
            {contact.isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div>
            <Text strong className="text-[#012643] text-lg flex items-center gap-1">
              {contact.name}
              {contact.isVerified && (
                <CheckCircleFilled className="text-blue-500 text-sm" />
              )}
            </Text>
            <Text className="text-sm text-gray-500">
              {contact.isOnline ? (
                <span className="text-green-500">Đang hoạt động</span>
              ) : (
                `Hoạt động ${contact.lastSeen || 'gần đây'}`
              )}
            </Text>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Tooltip title="Gọi thoại">
            <Button 
              type="text" 
              shape="circle" 
              icon={<PhoneOutlined className="text-[#e5698e]" />}
              className="hover:!bg-gray-100"
              size="large"
            />
          </Tooltip>
          <Tooltip title="Gọi video">
            <Button 
              type="text" 
              shape="circle" 
              icon={<VideoCameraOutlined className="text-[#e5698e]" />}
              className="hover:!bg-gray-100"
              size="large"
            />
          </Tooltip>
          <Tooltip title="Thông tin hội thoại">
            <Button 
              type="text" 
              shape="circle" 
              icon={<InfoCircleOutlined className="text-[#e5698e]" />}
              className="hover:!bg-gray-100"
              size="large"
            />
          </Tooltip>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((message, index) => {
          const prevMessage = index > 0 ? messages[index - 1] : undefined;
          const showDateSeparator = shouldShowDateSeparator(message, prevMessage);
          const isMe = message.senderId === 'me';
          const showAvatar = !isMe && (
            index === messages.length - 1 || 
            messages[index + 1]?.senderId !== message.senderId
          );

          return (
            <React.Fragment key={message.id}>
              {showDateSeparator && (
                <div className="text-center my-4">
                  <Text className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                    {formatDate(message.timestamp)}
                  </Text>
                </div>
              )}
              
              <MessageBubble 
                message={message}
                isMe={isMe}
                showAvatar={showAvatar}
                contact={contact}
                formatTime={formatTime}
                onReaction={onReaction}
              />
            </React.Fragment>
          );
        })}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 mb-2">
            <Avatar src={contact.avatar} size={32}>
              {contact.name[0]}
            </Avatar>
            <div className="bg-gray-200 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-end gap-2">
          {/* Action Buttons */}
          <div className="flex gap-1 mb-1">
            <Tooltip title="Đính kèm tệp">
              <Button 
                type="text" 
                shape="circle" 
                icon={<PaperClipOutlined className="text-[#e5698e]" />}
                className="hover:!bg-gray-100"
              />
            </Tooltip>
            <Tooltip title="Gửi ảnh">
              <Button 
                type="text" 
                shape="circle" 
                icon={<PictureOutlined className="text-[#e5698e]" />}
                className="hover:!bg-gray-100"
              />
            </Tooltip>
            <Tooltip title="Gửi GIF">
              <Button 
                type="text" 
                shape="circle" 
                icon={<GifOutlined className="text-[#e5698e]" />}
                className="hover:!bg-gray-100"
              />
            </Tooltip>
          </div>

          {/* Input */}
          <div className="flex-1 relative">
            <TextArea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Aa"
              autoSize={{ minRows: 1, maxRows: 4 }}
              className="!rounded-3xl !bg-gray-100 !border-none !py-3 !px-4 !pr-10 resize-none"
            />
            <Popover content={emojiPopover} trigger="click" placement="topRight">
              <Button 
                type="text" 
                shape="circle" 
                icon={<SmileOutlined className="text-[#e5698e]" />}
                className="!absolute right-1 bottom-1"
              />
            </Popover>
          </div>

          {/* Send Button */}
          {inputText.trim() ? (
            <Button 
              type="primary" 
              shape="circle" 
              icon={<SendOutlined />}
              onClick={handleSend}
              className="!bg-[#e5698e] !border-[#e5698e] hover:!bg-[#f381a3] mb-1"
              size="large"
            />
          ) : (
            <Tooltip title="Gửi tin nhắn thoại">
              <Button 
                type="text" 
                shape="circle" 
                icon={<AudioOutlined className="text-[#e5698e]" />}
                className="hover:!bg-gray-100 mb-1"
                size="large"
              />
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
};

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  showAvatar: boolean;
  contact: Contact;
  formatTime: (timestamp: string) => string;
  onReaction: (messageId: string, reaction: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMe,
  showAvatar,
  contact,
  formatTime,
  onReaction
}) => {
  const [showReactions, setShowReactions] = useState(false);

  const reactionMenu = (
    <div className="flex gap-1 bg-white rounded-full shadow-lg p-1">
      {REACTIONS.map(({ emoji }) => (
        <button
          key={emoji}
          className="hover:scale-125 transition-transform text-lg p-1"
          onClick={() => {
            onReaction(message.id, emoji);
            setShowReactions(false);
          }}
        >
          {emoji}
        </button>
      ))}
    </div>
  );

  return (
    <div 
      className={`flex items-end gap-2 mb-2 group ${isMe ? 'flex-row-reverse' : ''}`}
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
    >
      {/* Avatar */}
      {showAvatar && !isMe ? (
        <Avatar src={contact.avatar} size={32}>
          {contact.name[0]}
        </Avatar>
      ) : (
        <div className="w-8" />
      )}

      {/* Message Content */}
      <div className={`relative max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
        <Popover 
          content={reactionMenu} 
          trigger="click" 
          placement={isMe ? 'left' : 'right'}
          open={showReactions}
          onOpenChange={setShowReactions}
        >
          <div 
            className={`px-4 py-2 rounded-2xl cursor-pointer transition-all ${
              isMe 
                ? 'bg-gradient-to-r from-[#e5698e] to-[#f381a3] text-white rounded-br-md' 
                : 'bg-gray-200 text-gray-800 rounded-bl-md'
            }`}
          >
            {/* Image Message */}
            {message.type === 'image' && message.imageUrl && (
              <Image 
                src={message.imageUrl} 
                alt="Image" 
                className="rounded-lg max-w-[200px]"
              />
            )}
            
            {/* Text Message */}
            {message.type !== 'image' && (
              <Text className={isMe ? 'text-white' : ''}>
                {message.content}
              </Text>
            )}
          </div>
        </Popover>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className={`absolute -bottom-2 ${isMe ? 'left-0' : 'right-0'} flex bg-white rounded-full shadow-md px-1 py-0.5`}>
            {message.reactions.map((reaction, i) => (
              <span key={i} className="text-xs">{reaction}</span>
            ))}
          </div>
        )}

        {/* Time & Status */}
        <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
          <Text className="text-[10px] text-gray-400">
            {formatTime(message.timestamp)}
          </Text>
          {isMe && message.status && (
            <span className="text-[10px]">
              {message.status === 'sent' && <CheckOutlined className="text-gray-400" />}
              {message.status === 'delivered' && <DoubleRightOutlined className="text-gray-400" />}
              {message.status === 'seen' && (
                <Avatar src={contact.avatar} size={12} />
              )}
            </span>
          )}
        </div>
      </div>

      {/* Message Actions */}
      <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'mr-2' : 'ml-2'}`}>
        <Dropdown
          menu={{
            items: [
              { key: 'reply', label: 'Trả lời' },
              { key: 'forward', label: 'Chuyển tiếp' },
              { key: 'copy', label: 'Sao chép' },
              { type: 'divider' },
              { key: 'delete', label: 'Xóa', danger: true },
            ]
          }}
          trigger={['click']}
        >
          <Button type="text" shape="circle" icon={<MoreOutlined />} size="small" />
        </Dropdown>
      </div>
    </div>
  );
};

export default ChatWindow;
