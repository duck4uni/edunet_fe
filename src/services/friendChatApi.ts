import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery, API_BASE_URL } from './axiosBaseQuery';
import type { FriendUser, FriendRequest, ChatMessageFromServer } from '../models/chat';

interface SuccessResponse<T> {
  success: true;
  data: T;
}

interface MessagesResponse {
  messages: ChatMessageFromServer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const friendChatApi = createApi({
  reducerPath: 'friendChatApi',
  baseQuery: axiosBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['Friends', 'PendingRequests', 'SentRequests', 'Messages', 'UnreadCounts', 'LastMessages'],
  endpoints: (builder) => ({
    // Friend endpoints
    searchUsers: builder.query<SuccessResponse<FriendUser[]>, string>({
      query: (email) => ({
        url: `/friends/search?email=${encodeURIComponent(email)}`,
        method: 'GET',
      }),
    }),

    getFriends: builder.query<SuccessResponse<FriendUser[]>, void>({
      query: () => ({ url: '/friends', method: 'GET' }),
      providesTags: ['Friends'],
    }),

    getPendingRequests: builder.query<SuccessResponse<FriendRequest[]>, void>({
      query: () => ({ url: '/friends/pending', method: 'GET' }),
      providesTags: ['PendingRequests'],
    }),

    getSentRequests: builder.query<SuccessResponse<FriendRequest[]>, void>({
      query: () => ({ url: '/friends/sent', method: 'GET' }),
      providesTags: ['SentRequests'],
    }),

    sendFriendRequest: builder.mutation<any, { email: string }>({
      query: (body) => ({ url: '/friends/request', method: 'POST', data: body }),
      invalidatesTags: ['SentRequests'],
    }),

    respondToFriendRequest: builder.mutation<
      any,
      { friendshipId: string; action: 'accept' | 'reject' }
    >({
      query: (body) => ({ url: '/friends/respond', method: 'POST', data: body }),
      invalidatesTags: ['Friends', 'PendingRequests'],
    }),

    unfriend: builder.mutation<any, string>({
      query: (friendId) => ({
        url: `/friends/${friendId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Friends'],
    }),

    // Chat endpoints
    getMessages: builder.query<
      SuccessResponse<MessagesResponse>,
      { friendId: string; page?: number; limit?: number }
    >({
      query: ({ friendId, page = 1, limit = 50 }) => ({
        url: `/chat/messages/${friendId}?page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      providesTags: ['Messages'],
    }),

    getUnreadCounts: builder.query<
      SuccessResponse<{ senderId: string; count: string }[]>,
      void
    >({
      query: () => ({ url: '/chat/unread', method: 'GET' }),
      providesTags: ['UnreadCounts'],
    }),

    markAsRead: builder.mutation<any, string>({
      query: (senderId) => ({
        url: `/chat/read/${senderId}`,
        method: 'POST',
      }),
    }),

    getLastMessages: builder.query<
      SuccessResponse<ChatMessageFromServer[]>,
      void
    >({
      query: () => ({ url: '/chat/last-messages', method: 'GET' }),
      providesTags: ['LastMessages'],
    }),

    togglePinConversation: builder.mutation<
      SuccessResponse<{ isPinned: boolean }>,
      string
    >({
      query: (partnerId) => ({
        url: `/chat/pin/${partnerId}`,
        method: 'POST',
      }),
      invalidatesTags: ['LastMessages'],
    }),

    hideConversation: builder.mutation<SuccessResponse<null>, string>({
      query: (partnerId) => ({
        url: `/chat/conversation/${partnerId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LastMessages'],
    }),
  }),
});

export const {
  useLazySearchUsersQuery,
  useGetFriendsQuery,
  useGetPendingRequestsQuery,
  useGetSentRequestsQuery,
  useSendFriendRequestMutation,
  useRespondToFriendRequestMutation,
  useUnfriendMutation,
  useGetMessagesQuery,
  useLazyGetMessagesQuery,
  useGetUnreadCountsQuery,
  useMarkAsReadMutation,
  useGetLastMessagesQuery,
  useTogglePinConversationMutation,
  useHideConversationMutation,
} = friendChatApi;
