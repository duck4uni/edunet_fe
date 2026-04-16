import React, { useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Button,
  Image,
  Input,
  Popover,
  Tooltip,
  Typography,
} from 'antd';
import {
  ArrowLeftOutlined,
  AudioOutlined,
  CheckCircleFilled,
  CheckOutlined,
  PaperClipOutlined,
  PhoneOutlined,
  PictureOutlined,
  SendOutlined,
  SmileOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import type { Contact, Message } from '../../models/chat';

const { Text } = Typography;
const { TextArea } = Input;

interface ChatWindowProps {
  contact: Contact | null;
  messages: Message[];
  onSendMessage: (content: string, type?: string) => void;
  onReaction: (messageId: string, reaction: string) => void;
  onBack?: () => void;
}

const REACTIONS = ['❤️', '😂', '😮', '😢', '😠', '👍', '🔥'];
const EMOJIS = ['😀', '😂', '😍', '🥰', '😊', '😎', '🤔', '😅', '😭', '🥺', '👏', '🙏', '💪', '❤️', '🔥', '🎉'];

const ChatWindow: React.FC<ChatWindowProps> = ({
  contact,
  messages,
  onSendMessage,
  onReaction,
  onBack,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, contact?.id]);

  useEffect(() => {
    const handleViewportResize = () => {
      const textAreaElement = inputRef.current?.resizableTextArea?.textArea as HTMLTextAreaElement | undefined;
      if (textAreaElement && document.activeElement === textAreaElement) {
        scrollToBottom('auto');
      }
    };

    window.visualViewport?.addEventListener('resize', handleViewportResize);
    window.visualViewport?.addEventListener('scroll', handleViewportResize);

    return () => {
      window.visualViewport?.removeEventListener('resize', handleViewportResize);
      window.visualViewport?.removeEventListener('scroll', handleViewportResize);
    };
  }, []);

  const handleSend = () => {
    const content = inputText.trim();
    if (!content) return;

    onSendMessage(content);
    setInputText('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleInputFocus = () => {
    setTimeout(() => {
      scrollToBottom('auto');
    }, 240);
  };

  if (!contact) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center bg-gradient-to-br from-[#f4fbff] via-white to-[#eef8ff] px-4">
        <div className="max-w-sm rounded-3xl border border-[#d4e9f8] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#012643] text-white">
            <SendOutlined className="text-xl" />
          </div>
          <h3 className="text-lg font-semibold text-[#012643]">Chọn một hội thoại</h3>
          <p className="mt-2 text-sm text-[#6f8ca8]">Danh sách bên trái sẽ giúp bạn mở nhanh cuộc trò chuyện.</p>
        </div>
      </div>
    );
  }

  const emojiPicker = (
    <div className="grid max-w-[220px] grid-cols-4 gap-1 p-1">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          className="rounded-md p-1 text-lg transition hover:bg-slate-100"
          onClick={() => setInputText((prev) => prev + emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f4fbff]">
      <div className="shrink-0 border-b border-[#d7ebf8] bg-white/95 px-4 py-3 backdrop-blur md:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {onBack && (
              <Button
                type="text"
                shape="circle"
                icon={<ArrowLeftOutlined />}
                onClick={onBack}
                className="!text-[#446b8e] hover:!bg-[#30C2EC]/15 hover:!text-[#012643]"
              />
            )}

            <div className="relative">
              <Avatar src={contact.avatar} size={44}>
                {contact.name[0]}
              </Avatar>
              {contact.isOnline && (
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
              )}
            </div>

            <div className="min-w-0">
              <Text strong className="!truncate !text-base !text-[#012643]">
                {contact.name}
                {contact.isVerified && <CheckCircleFilled className="ml-1 text-xs text-[#30C2EC]" />}
              </Text>
              <Text className="block text-xs text-[#7391ab]">
                {contact.isOnline ? 'Đang hoạt động' : `Hoạt động ${contact.lastSeen || 'gần đây'}`}
              </Text>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Tooltip title="Gọi thoại">
              <Button type="text" shape="circle" icon={<PhoneOutlined />} className="!text-[#5f7e9d] hover:!bg-[#30C2EC]/15 hover:!text-[#012643]" />
            </Tooltip>
            <Tooltip title="Gọi video">
              <Button type="text" shape="circle" icon={<VideoCameraOutlined />} className="!text-[#5f7e9d] hover:!bg-[#30C2EC]/15 hover:!text-[#012643]" />
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6">
        {messages.map((message, index) => {
          const previousMessage = index > 0 ? messages[index - 1] : undefined;
          const isMe = message.senderId === 'me';
          const currentDate = new Date(message.timestamp).toDateString();
          const previousDate = previousMessage ? new Date(previousMessage.timestamp).toDateString() : null;
          const shouldShowDate = !previousDate || currentDate !== previousDate;

          return (
            <React.Fragment key={message.id}>
              {shouldShowDate && (
                <div className="my-4 text-center">
                  <span className="rounded-full bg-[#e7f4ff] px-3 py-1 text-[11px] font-medium text-[#6d8aa6]">
                    {formatDate(message.timestamp)}
                  </span>
                </div>
              )}

              <MessageBubble
                contact={contact}
                isMe={isMe}
                message={message}
                onReaction={onReaction}
              />
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 border-t border-[#d7ebf8] bg-white px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] md:px-5">
        <div className="flex items-end gap-2">
          <div className="flex gap-1 pb-1">
            <Tooltip title="Đính kèm">
              <Button type="text" shape="circle" icon={<PaperClipOutlined />} className="!text-[#5f7e9d] hover:!bg-[#30C2EC]/15 hover:!text-[#012643]" />
            </Tooltip>
            <Tooltip title="Gửi ảnh">
              <Button type="text" shape="circle" icon={<PictureOutlined />} className="!text-[#5f7e9d] hover:!bg-[#30C2EC]/15 hover:!text-[#012643]" />
            </Tooltip>
          </div>

          <div className="relative flex-1">
            <TextArea
              ref={inputRef}
              value={inputText}
              onChange={(event) => setInputText(event.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              autoSize={{ minRows: 1, maxRows: 4 }}
              placeholder="Nhập tin nhắn..."
              className="!rounded-2xl !border-[#cde7f8] !bg-[#f3fbff] !py-2.5 !pr-10 !pl-3"
            />

            <Popover content={emojiPicker} trigger="click" placement="topRight">
              <Button
                type="text"
                shape="circle"
                icon={<SmileOutlined />}
                className="!absolute bottom-1 right-1 !text-[#5f7e9d] hover:!bg-[#dff2ff] hover:!text-[#012643]"
              />
            </Popover>
          </div>

          {inputText.trim() ? (
            <Button
              type="primary"
              shape="circle"
              icon={<SendOutlined />}
              onClick={handleSend}
              className="!h-10 !w-10 !bg-[#012643] !border-[#012643] !shadow-none hover:!bg-[#023e6d] hover:!border-[#023e6d]"
            />
          ) : (
            <Tooltip title="Tin nhắn thoại">
              <Button
                type="text"
                shape="circle"
                icon={<AudioOutlined />}
                className="!h-10 !w-10 !text-[#5f7e9d] hover:!bg-[#30C2EC]/15 hover:!text-[#012643]"
              />
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
};

interface MessageBubbleProps {
  contact: Contact;
  isMe: boolean;
  message: Message;
  onReaction: (messageId: string, reaction: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  contact,
  isMe,
  message,
  onReaction,
}) => {
  const [reactionOpen, setReactionOpen] = useState(false);

  const reactionContent = (
    <div className="flex gap-1 rounded-full bg-white p-1 shadow-md">
      {REACTIONS.map((reaction) => (
        <button
          key={reaction}
          type="button"
          className="rounded-full px-1 text-lg transition hover:scale-110"
          onClick={() => {
            onReaction(message.id, reaction);
            setReactionOpen(false);
          }}
        >
          {reaction}
        </button>
      ))}
    </div>
  );

  return (
    <div className={`mb-3 flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
      {!isMe && (
        <Avatar src={contact.avatar} size={30} className="mb-1 shrink-0">
          {contact.name[0]}
        </Avatar>
      )}

      <div className={`max-w-[85%] md:max-w-[72%] ${isMe ? 'items-end' : 'items-start'}`}>
        <Popover
          content={reactionContent}
          trigger="click"
          placement={isMe ? 'leftTop' : 'rightTop'}
          open={reactionOpen}
          onOpenChange={setReactionOpen}
        >
          <div
            className={`cursor-pointer rounded-2xl px-3.5 py-2.5 shadow-sm transition ${isMe ? 'rounded-br-md bg-gradient-to-r from-[#012643] to-[#0b4a79] text-white' : 'rounded-bl-md border border-[#d5eaf8] bg-white text-[#234a6b]'}`}
          >
            {message.type === 'image' && message.imageUrl ? (
              <Image src={message.imageUrl} alt="image" className="rounded-xl" width={220} />
            ) : (
              <Text className={isMe ? '!text-white' : '!text-[#234a6b]'}>{message.content}</Text>
            )}
          </div>
        </Popover>

        {message.reactions && message.reactions.length > 0 && (
          <div className={`mt-1 flex ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div className="rounded-full border border-[#d6eaf8] bg-white px-2 py-0.5 text-xs shadow-sm">
              {message.reactions.join(' ')}
            </div>
          </div>
        )}

        <div className={`mt-1 flex items-center gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[11px] text-[#86a2ba]">{formatTime(message.timestamp)}</span>
          {isMe && message.status && (
            <span className="text-[11px] text-[#86a2ba]">
              {message.status === 'sending' && '...'}
              {message.status === 'sent' && <CheckOutlined />}
              {message.status === 'delivered' && '✓✓'}
              {message.status === 'seen' && <Avatar src={contact.avatar} size={12} />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Hôm nay';
  if (date.toDateString() === yesterday.toDateString()) return 'Hôm qua';

  return date.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
};

const formatTime = (timestamp: string) => new Date(timestamp).toLocaleTimeString('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
});

export default ChatWindow;