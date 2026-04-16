import React, { useMemo, useState } from 'react';
import { Avatar, Badge, Button, Dropdown, Input, Typography } from 'antd';
import {
  CheckCircleFilled,
  DeleteOutlined,
  MessageOutlined,
  PushpinFilled,
  PushpinOutlined,
  SearchOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { Contact, Message } from '../../models/chat';

const { Text } = Typography;

type FilterKey = 'all' | 'unread' | 'groups' | 'pinned';

interface ContactListProps {
  contacts: Contact[];
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact) => void;
  lastMessages: Record<string, Message>;
  onPinContact?: (contactId: string) => void;
  onDeleteConversation?: (contactId: string) => void;
}

const ContactList: React.FC<ContactListProps> = ({
  contacts,
  selectedContact,
  onSelectContact,
  lastMessages,
  onPinContact,
  onDeleteConversation,
}) => {
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const filteredContacts = useMemo(() => contacts
    .filter((contact) => contact.name.toLowerCase().includes(searchText.toLowerCase()))
    .filter((contact) => {
      if (activeFilter === 'unread') return contact.unreadCount > 0;
      if (activeFilter === 'groups') return Boolean(contact.isGroup);
      if (activeFilter === 'pinned') return Boolean(contact.isPinned);

      return true;
    }), [activeFilter, contacts, searchText]);

  const pinnedContacts = filteredContacts.filter((contact) => contact.isPinned);
  const regularContacts = filteredContacts.filter((contact) => !contact.isPinned);

  const stats = {
    all: contacts.length,
    unread: contacts.filter((contact) => contact.unreadCount > 0).length,
    groups: contacts.filter((contact) => contact.isGroup).length,
    pinned: contacts.filter((contact) => contact.isPinned).length,
  };

  const filters: Array<{ key: FilterKey; label: string; count: number }> = [
    { key: 'all', label: 'Tất cả', count: stats.all },
    { key: 'unread', label: 'Chưa đọc', count: stats.unread },
    { key: 'groups', label: 'Nhóm', count: stats.groups },
    { key: 'pinned', label: 'Ghim', count: stats.pinned },
  ];

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const msDiff = now.getTime() - date.getTime();
    const minuteDiff = Math.floor(msDiff / (1000 * 60));

    if (minuteDiff < 1) return 'Vừa xong';
    if (minuteDiff < 60) return `${minuteDiff}p`;

    const hourDiff = Math.floor(minuteDiff / 60);
    if (hourDiff < 24) return `${hourDiff}h`;

    if (hourDiff < 48) return 'Hôm qua';
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const buildPreview = (message?: Message) => {
    if (!message) return 'Bắt đầu cuộc trò chuyện';
    if (message.type === 'image') return 'Đã gửi một hình ảnh';
    if (message.type === 'audio') return 'Đã gửi một tin nhắn thoại';
    if (message.type === 'file') return message.fileName || 'Đã gửi một tệp';

    return message.content;
  };

  const renderSection = (title: string, sectionContacts: Contact[]) => {
    if (sectionContacts.length === 0) return null;

    return (
      <div className="px-2 pt-2">
        <div className="mb-2 flex items-center gap-2 px-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{title}</span>
        </div>
        <div className="space-y-1">
          {sectionContacts.map((contact) => (
            <ContactItem
              key={contact.id}
              contact={contact}
              isSelected={selectedContact?.id === contact.id}
              onClick={() => onSelectContact(contact)}
              lastMessage={lastMessages[contact.id]}
              preview={buildPreview(lastMessages[contact.id])}
              formatTime={formatTime}
              onPin={onPinContact ? () => onPinContact(contact.id) : undefined}
              onDelete={onDeleteConversation ? () => onDeleteConversation(contact.id) : undefined}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-[#d7ebf8] bg-white/95 px-4 py-4 backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <Text className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#30C2EC]">Tin nhắn</Text>
            <h2 className="text-xl font-semibold text-[#012643]">Hội thoại</h2>
          </div>
          <Button type="text" shape="circle" icon={<MessageOutlined />} className="!text-[#5f7e9d] hover:!bg-[#30C2EC]/15 hover:!text-[#012643]" />
        </div>

        <Input
          prefix={<SearchOutlined className="text-[#8ba4bc]" />}
          placeholder="Tìm kiếm hội thoại"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          className="!rounded-xl !border-[#cde7f8] !bg-[#f3fbff]"
          size="large"
        />

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {filters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActiveFilter(filter.key)}
              className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition ${activeFilter === filter.key ? 'border-[#30C2EC] bg-[#30C2EC] text-white' : 'border-[#d5e9f8] bg-white text-[#5d7790] hover:border-[#30C2EC]/60 hover:text-[#012643]'}`}
            >
              {filter.key === 'groups' && <TeamOutlined />}
              {filter.key === 'pinned' && <PushpinOutlined />}
              <span>{filter.label}</span>
              <span className={`rounded-full px-1.5 ${activeFilter === filter.key ? 'bg-white/20' : 'bg-[#eef8ff] text-[#7290ab]'}`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3 pt-2">
        {filteredContacts.length === 0 ? (
          <div className="mx-2 mt-3 rounded-2xl border border-dashed border-[#cfe6f7] bg-white p-6 text-center text-sm text-[#7f9ab3]">
            Không tìm thấy hội thoại phù hợp.
          </div>
        ) : (
          <>
            {renderSection('Đã ghim', pinnedContacts)}
            {renderSection('Gần đây', regularContacts)}
          </>
        )}
      </div>
    </div>
  );
};

interface ContactItemProps {
  contact: Contact;
  isSelected: boolean;
  onClick: () => void;
  lastMessage?: Message;
  preview: string;
  formatTime: (timestamp?: string) => string;
  onPin?: () => void;
  onDelete?: () => void;
}

const ContactItem: React.FC<ContactItemProps> = ({
  contact,
  isSelected,
  onClick,
  lastMessage,
  preview,
  formatTime,
  onPin,
  onDelete,
}) => {
  const isSupportBot = contact.id === 'support-bot';

  const contextMenuItems = isSupportBot
    ? []
    : [
        {
          key: 'pin',
          icon: contact.isPinned ? <PushpinFilled /> : <PushpinOutlined />,
          label: contact.isPinned ? 'Bỏ ghim' : 'Ghim hội thoại',
          onClick: () => onPin?.(),
        },
        {
          key: 'delete',
          icon: <DeleteOutlined />,
          label: 'Xóa hội thoại',
          danger: true,
          onClick: () => onDelete?.(),
        },
      ];

  const contactButton = (
    <button
      type="button"
      className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${isSelected ? 'bg-gradient-to-r from-[#012643] to-[#0b4a79] text-white shadow-md shadow-[#012643]/20' : 'hover:bg-[#30C2EC]/10'}`}
      onClick={onClick}
    >
      <div className="relative">
        <Badge dot={contact.isOnline} status="success" offset={[-4, 36]}>
          <Avatar src={contact.avatar} size={52} className="!border !border-white shadow-sm">
            {contact.name[0]}
          </Avatar>
        </Badge>
        {contact.isGroup && (
          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#30C2EC] text-[10px] text-white">
            {contact.memberCount}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <Text
            strong
            className={`!truncate ${isSelected ? '!text-white' : '!text-[#012643]'} ${contact.unreadCount > 0 ? '!font-semibold' : ''}`}
          >
            {contact.name}
            {contact.isVerified && (
              <CheckCircleFilled className={`ml-1 text-xs ${isSelected ? 'text-[#8de3ff]' : 'text-[#30C2EC]'}`} />
            )}
          </Text>
          <Text className={`shrink-0 text-[11px] ${isSelected ? '!text-[#cfefff]' : '!text-[#88a2ba]'}`}>
            {formatTime(lastMessage?.timestamp)}
          </Text>
        </div>

        <div className="mt-1 flex items-center justify-between gap-2">
          <Text
            ellipsis
            className={`!text-sm ${isSelected ? '!text-[#eefbff]' : contact.unreadCount > 0 ? '!text-[#2d4f6d]' : '!text-[#6f8ca7]'}`}
          >
            {lastMessage?.senderId === 'me' && (
              <span className={isSelected ? 'text-[#bde9ff]' : 'text-[#8aa7be]'}>Bạn: </span>
            )}
            {preview}
          </Text>

          {contact.unreadCount > 0 && (
            <Badge
              count={contact.unreadCount}
              style={{
                backgroundColor: isSelected ? '#30C2EC' : '#00B1F5',
                color: '#ffffff',
              }}
            />
          )}
        </div>
      </div>

      {!isSupportBot && (
        <Button
          type="text"
          shape="circle"
          icon={contact.isPinned ? <PushpinFilled /> : <PushpinOutlined />}
          className={`!shrink-0 !opacity-0 transition-opacity group-hover:!opacity-100 ${isSelected ? '!text-[#c3ebff]' : contact.isPinned ? '!text-[#30C2EC]' : '!text-[#8aa6be]'}`}
          onClick={(event) => {
            event.stopPropagation();
            onPin?.();
          }}
        />
      )}
    </button>
  );

  if (isSupportBot) return contactButton;

  return (
    <Dropdown menu={{ items: contextMenuItems }} trigger={['contextMenu']}>
      {contactButton}
    </Dropdown>
  );
};

export default ContactList;