import React, { useState } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Empty,
  Input,
  List,
  Tabs,
  Tag,
  message as antMessage,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  MessageOutlined,
  SearchOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { FriendUser, FriendRequest } from '../../../models/chat';
import {
  useGetFriendsQuery,
  useGetPendingRequestsQuery,
  useGetSentRequestsQuery,
  useLazySearchUsersQuery,
  useSendFriendRequestMutation,
  useRespondToFriendRequestMutation,
  useUnfriendMutation,
} from '../../../services/friendChatApi';

interface FriendsPageProps {
  embedded?: boolean;
}

const FriendsPage: React.FC<FriendsPageProps> = ({ embedded = false }) => {
  const navigate = useNavigate();

  const { data: friendsRes, refetch: refetchFriends, isLoading: loadingFriends } = useGetFriendsQuery();
  const { data: pendingRes, refetch: refetchPending, isLoading: loadingPending } = useGetPendingRequestsQuery();
  const { data: sentRes, isLoading: loadingSent } = useGetSentRequestsQuery();

  const friends: FriendUser[] = (friendsRes as any)?.data ?? [];
  const pendingRequests: FriendRequest[] = (pendingRes as any)?.data ?? [];
  const sentRequests: FriendRequest[] = (sentRes as any)?.data ?? [];

  const [searchEmail, setSearchEmail] = useState('');
  const [searchTrigger, { data: searchRes, isFetching: isSearching }] = useLazySearchUsersQuery();
  const searchResults: FriendUser[] = (searchRes as any)?.data ?? [];

  const [sendFriendRequest] = useSendFriendRequestMutation();
  const [respondToRequest] = useRespondToFriendRequestMutation();
  const [unfriend] = useUnfriendMutation();

  const handleSearch = () => {
    if (searchEmail.trim()) searchTrigger(searchEmail.trim());
  };

  const handleSendRequest = async (email: string) => {
    try {
      await sendFriendRequest({ email }).unwrap();
      antMessage.success('Đã gửi lời mời kết bạn!');
      searchTrigger(searchEmail.trim());
    } catch {
      antMessage.error('Gửi lời mời thất bại');
    }
  };

  const handleRespond = async (friendshipId: string, action: 'accept' | 'reject') => {
    try {
      await respondToRequest({ friendshipId, action }).unwrap();
      antMessage.success(action === 'accept' ? 'Đã chấp nhận lời mời!' : 'Đã từ chối lời mời');
      refetchFriends();
      refetchPending();
    } catch {
      antMessage.error('Thao tác thất bại');
    }
  };

  const handleUnfriend = async (friendId: string, name: string) => {
    try {
      await unfriend(friendId).unwrap();
      antMessage.success(`Đã hủy kết bạn với ${name}`);
      refetchFriends();
    } catch {
      antMessage.error('Hủy kết bạn thất bại');
    }
  };

  const getDisplayName = (user: { firstName?: string | null; lastName?: string | null; email: string }) => {
    const full = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return full || user.email;
  };

  const tabItems = [
    {
      key: 'friends',
      label: (
        <span className="flex items-center gap-1.5">
          <TeamOutlined />
          Bạn bè
          {friends.length > 0 && (
            <Tag className="ml-1 !text-xs !px-1.5 !py-0 !leading-5">{friends.length}</Tag>
          )}
        </span>
      ),
      children: (
        <div className="py-2">
          {friends.length === 0 && !loadingFriends ? (
            <Empty
              description="Bạn chưa có bạn bè nào. Hãy tìm kiếm và kết bạn ngay!"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <List
              loading={loadingFriends}
              dataSource={friends}
              grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
              renderItem={(friend) => {
                const name = getDisplayName(friend);
                return (
                  <List.Item key={friend.id}>
                    <Card
                      className="!rounded-2xl hover:shadow-md transition-shadow"
                      bodyStyle={{ padding: '16px' }}
                    >
                      <div className="flex flex-col items-center gap-3 text-center">
                        <Avatar
                          src={friend.avatar}
                          size={64}
                          className="!bg-[#30C2EC] !text-white text-xl font-semibold"
                        >
                          {name[0]?.toUpperCase()}
                        </Avatar>
                        <div>
                          <p className="font-semibold text-[#012643] text-sm leading-tight">{name}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{friend.email}</p>
                          {friend.role && (
                            <Tag
                              color={friend.role === 'teacher' ? 'blue' : 'default'}
                              className="mt-1 !text-[10px]"
                            >
                              {friend.role === 'teacher' ? 'Giáo viên' : 'Học viên'}
                            </Tag>
                          )}
                        </div>
                        <div className="flex gap-2 w-full">
                          <Button
                            icon={<MessageOutlined />}
                            size="small"
                            type="primary"
                            className="flex-1 !bg-[#012643] !border-[#012643]"
                            onClick={() => navigate('/chat')}
                          >
                            Nhắn tin
                          </Button>
                          <Button
                            icon={<UserDeleteOutlined />}
                            size="small"
                            danger
                            className="flex-1"
                            onClick={() => handleUnfriend(friend.id, name)}
                          >
                            Hủy kết bạn
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </List.Item>
                );
              }}
            />
          )}
        </div>
      ),
    },
    {
      key: 'search',
      label: (
        <span className="flex items-center gap-1.5">
          <SearchOutlined />
          Tìm kiếm
        </span>
      ),
      children: (
        <div className="py-2">
          <Input.Search
            placeholder="Nhập email để tìm người dùng..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            onSearch={handleSearch}
            loading={isSearching}
            allowClear
            size="large"
            className="mb-4"
          />
          {searchResults.length > 0 ? (
            <List
              dataSource={searchResults}
              renderItem={(user) => {
                const name = getDisplayName(user);
                return (
                  <List.Item
                    key={user.id}
                    className="!px-4 hover:bg-gray-50 rounded-xl transition-colors"
                    actions={[
                      user.friendshipStatus === 'accepted' ? (
                        <Tag key="friend" color="success" icon={<CheckOutlined />}>
                          Bạn bè
                        </Tag>
                      ) : user.friendshipStatus === 'pending' ? (
                        <Tag key="pending" color="warning">
                          Đã gửi
                        </Tag>
                      ) : (
                        <Button
                          key="add"
                          type="primary"
                          size="small"
                          icon={<UserAddOutlined />}
                          onClick={() => handleSendRequest(user.email)}
                          className="!bg-[#012643] !border-[#012643]"
                        >
                          Kết bạn
                        </Button>
                      ),
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar src={user.avatar} size={44} className="!bg-[#30C2EC]">
                          {name[0]?.toUpperCase()}
                        </Avatar>
                      }
                      title={<span className="font-medium text-[#012643]">{name}</span>}
                      description={user.email}
                    />
                  </List.Item>
                );
              }}
            />
          ) : searchEmail && !isSearching ? (
            <Empty description="Không tìm thấy người dùng với email này" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : !searchEmail ? (
            <div className="text-center py-12 text-gray-400">
              <SearchOutlined className="text-4xl mb-3" />
              <p>Nhập email để tìm kiếm bạn bè</p>
            </div>
          ) : null}
        </div>
      ),
    },
    {
      key: 'pending',
      label: (
        <span className="flex items-center gap-1.5">
          <Badge count={pendingRequests.length} size="small" offset={[4, 0]}>
            <span>Lời mời</span>
          </Badge>
        </span>
      ),
      children: (
        <div className="py-2">
          {pendingRequests.length === 0 && !loadingPending ? (
            <Empty description="Không có lời mời kết bạn nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <List
              loading={loadingPending}
              dataSource={pendingRequests}
              renderItem={(req) => {
                const name = getDisplayName(req);
                return (
                  <List.Item
                    key={req.friendshipId}
                    className="!px-4 hover:bg-gray-50 rounded-xl transition-colors"
                    actions={[
                      <Button
                        key="accept"
                        type="primary"
                        size="small"
                        icon={<CheckOutlined />}
                        onClick={() => handleRespond(req.friendshipId, 'accept')}
                        className="!bg-green-600 !border-green-600"
                      >
                        Chấp nhận
                      </Button>,
                      <Button
                        key="reject"
                        size="small"
                        danger
                        icon={<CloseOutlined />}
                        onClick={() => handleRespond(req.friendshipId, 'reject')}
                      >
                        Từ chối
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar src={req.avatar} size={44} className="!bg-[#30C2EC]">
                          {name[0]?.toUpperCase()}
                        </Avatar>
                      }
                      title={<span className="font-medium text-[#012643]">{name}</span>}
                      description={req.email}
                    />
                  </List.Item>
                );
              }}
            />
          )}
        </div>
      ),
    },
    {
      key: 'sent',
      label: (
        <span className="flex items-center gap-1.5">
          Đã gửi
          {sentRequests.length > 0 && (
            <Tag className="ml-1 !text-xs !px-1.5 !py-0 !leading-5">{sentRequests.length}</Tag>
          )}
        </span>
      ),
      children: (
        <div className="py-2">
          {sentRequests.length === 0 && !loadingSent ? (
            <Empty description="Chưa gửi lời mời kết bạn nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <List
              loading={loadingSent}
              dataSource={sentRequests}
              renderItem={(req) => {
                const name = getDisplayName(req);
                return (
                  <List.Item
                    key={req.friendshipId}
                    className="!px-4 hover:bg-gray-50 rounded-xl transition-colors"
                    extra={
                      <Tag color="warning" className="!text-xs">
                        Chờ xác nhận
                      </Tag>
                    }
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar src={req.avatar} size={44} className="!bg-[#30C2EC]">
                          {name[0]?.toUpperCase()}
                        </Avatar>
                      }
                      title={<span className="font-medium text-[#012643]">{name}</span>}
                      description={req.email}
                    />
                  </List.Item>
                );
              }}
            />
          )}
        </div>
      ),
    },
  ];

  const friendsContent = (
    <div className="rounded-3xl bg-white shadow-[0_20px_45px_-28px_rgba(1,38,67,0.2)] border border-[#d5ebf8] overflow-hidden">
      <Tabs
        defaultActiveKey="friends"
        items={tabItems}
        className="!px-6 pt-4"
        size="large"
      />
    </div>
  );

  if (embedded) {
    return friendsContent;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3fbff] via-[#eef8ff] to-[#e8f6ff] px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl">
        {friendsContent}
      </div>
    </div>
  );
};

export default FriendsPage;
