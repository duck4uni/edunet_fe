import React, { useState } from 'react';
import { Input, Avatar, Badge, Typography, Dropdown, Button, Tabs } from 'antd';
import { 
  SearchOutlined, 
  MoreOutlined, 
  EditOutlined,
  PushpinOutlined,
  BellOutlined,
  DeleteOutlined,
  CheckCircleFilled
} from '@ant-design/icons';
import type { Contact, Message } from '../../models/chat';

const { Text } = Typography;

interface ContactListProps {
  contacts: Contact[];
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact) => void;
  lastMessages: Record<string, Message>;
}

const ContactList: React.FC<ContactListProps> = ({ 
  contacts, 
  selectedContact, 
  onSelectContact,
  lastMessages 
}) => {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchText.toLowerCase())
  ).filter(contact => {
    if (activeTab === 'unread') return contact.unreadCount > 0;
    if (activeTab === 'groups') return contact.isGroup;
    return true;
  });

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Vừa xong';
    if (hours < 24) return `${hours}h trước`;
    if (hours < 48) return 'Hôm qua';
    return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
  };

  const getContactMenu = (contact: Contact) => ({
    items: [
      { key: 'pin', icon: <PushpinOutlined />, label: contact.isPinned ? 'Bỏ ghim' : 'Ghim hội thoại' },
      { key: 'mute', icon: <BellOutlined />, label: contact.isMuted ? 'Bật thông báo' : 'Tắt thông báo' },
      { type: 'divider' as const },
      { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa hội thoại', danger: true },
    ],
  });

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#012643]">Tin nhắn</h2>
          <div className="flex gap-2">
            <Button 
              type="text" 
              shape="circle" 
              icon={<MoreOutlined className="text-lg" />}
              className="hover:!bg-gray-100"
            />
            <Button 
              type="text" 
              shape="circle" 
              icon={<EditOutlined className="text-lg" />}
              className="hover:!bg-gray-100"
            />
          </div>
        </div>
        
        {/* Search */}
        <Input
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder="Tìm kiếm hội thoại"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="!rounded-full !bg-gray-100 hover:!bg-gray-50 !border-none"
          size="large"
        />
      </div>

      {/* Tabs */}
      <div className="px-2">
        <Tabs 
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: 'all', label: 'Tất cả' },
            { key: 'unread', label: 'Chưa đọc' },
            { key: 'groups', label: 'Nhóm' },
          ]}
          className="!mb-0"
        />
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto">
        {/* Pinned Section */}
        {filteredContacts.some(c => c.isPinned) && (
          <div className="px-4 py-2">
            <Text className="text-xs text-gray-500 font-semibold uppercase">Đã ghim</Text>
          </div>
        )}
        
        {filteredContacts.filter(c => c.isPinned).map(contact => (
          <ContactItem 
            key={contact.id}
            contact={contact}
            isSelected={selectedContact?.id === contact.id}
            onClick={() => onSelectContact(contact)}
            lastMessage={lastMessages[contact.id]}
            formatTime={formatTime}
            menu={getContactMenu(contact)}
          />
        ))}

        {/* All Chats Section */}
        {filteredContacts.some(c => !c.isPinned) && (
          <div className="px-4 py-2">
            <Text className="text-xs text-gray-500 font-semibold uppercase">Tất cả hội thoại</Text>
          </div>
        )}
        
        {filteredContacts.filter(c => !c.isPinned).map(contact => (
          <ContactItem 
            key={contact.id}
            contact={contact}
            isSelected={selectedContact?.id === contact.id}
            onClick={() => onSelectContact(contact)}
            lastMessage={lastMessages[contact.id]}
            formatTime={formatTime}
            menu={getContactMenu(contact)}
          />
        ))}

        {filteredContacts.length === 0 && (
          <div className="text-center py-8">
            <Text className="text-gray-400">Không tìm thấy hội thoại</Text>
          </div>
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
  formatTime: (timestamp: string) => string;
  menu: any;
}

const ContactItem: React.FC<ContactItemProps> = ({ 
  contact, 
  isSelected, 
  onClick, 
  lastMessage,
  formatTime,
  menu
}) => {
  return (
    <div 
      className={`flex items-center gap-3 p-3 mx-2 rounded-xl cursor-pointer transition-all duration-200 group ${
        isSelected 
          ? 'bg-gradient-to-r from-[#012643]/10 to-[#17EAD9]/10' 
          : 'hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      {/* Avatar */}
      <div className="relative">
        <Badge dot={contact.isOnline} status="success" offset={[-4, 36]}>
          <Avatar 
            src={contact.avatar} 
            size={56}
            className="!border-2 !border-white shadow-sm"
          >
            {contact.name[0]}
          </Avatar>
        </Badge>
        {contact.isGroup && (
          <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {contact.memberCount}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <Text 
            strong 
            className={`text-[#012643] ${contact.unreadCount > 0 ? '!font-bold' : ''}`}
          >
            {contact.name}
            {contact.isVerified && (
              <CheckCircleFilled className="text-blue-500 ml-1 text-sm" />
            )}
          </Text>
          <Text className="text-xs text-gray-400">
            {lastMessage ? formatTime(lastMessage.timestamp) : ''}
          </Text>
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <Text 
            ellipsis 
            className={`text-sm ${contact.unreadCount > 0 ? 'text-[#012643] font-medium' : 'text-gray-500'}`}
          >
            {lastMessage?.senderId === 'me' && (
              <span className="text-gray-400">Bạn: </span>
            )}
            {lastMessage?.content || 'Bắt đầu cuộc trò chuyện'}
          </Text>
          
          <div className="flex items-center gap-2">
            {contact.isMuted && (
              <BellOutlined className="text-gray-400 text-xs" />
            )}
            {contact.unreadCount > 0 && (
              <Badge 
                count={contact.unreadCount} 
                className="!ml-2"
                style={{ backgroundColor: '#e5698e' }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Menu - visible on hover */}
      <Dropdown menu={menu} trigger={['click']} placement="bottomRight">
        <Button 
          type="text" 
          shape="circle" 
          icon={<MoreOutlined />}
          onClick={(e) => e.stopPropagation()}
          className="!opacity-0 group-hover:!opacity-100 transition-opacity"
        />
      </Dropdown>
    </div>
  );
};

export default ContactList;
