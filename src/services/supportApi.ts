import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery, API_BASE_URL } from './axiosBaseQuery';
import type { ApiResponse, PaginatedResponse } from './authApi';

// Support Ticket Types
export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'course' | 'account' | 'other';
  attachments?: object;
  response?: string;
  respondedAt?: string;
  userId: string;
  assignedToId?: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  assignedTo?: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketRequest {
  subject: string;
  message?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: 'technical' | 'billing' | 'course' | 'account' | 'other';
  attachments?: object;
}

export interface TicketStats {
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

export interface QueryParams {
  page?: number;
  size?: number | string;
  filter?: string;
  sort?: string;
  include?: string;
}

export const supportApi = createApi({
  reducerPath: 'supportApi',
  baseQuery: axiosBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['SupportTickets'],
  endpoints: (builder) => ({
    // Get all tickets (admin)
    getTickets: builder.query<PaginatedResponse<SupportTicket>, QueryParams | void>({
      query: (params) => ({
        url: '/support-tickets',
        method: 'get',
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data?.rows
          ? [
              ...result.data.rows.map(({ id }) => ({ type: 'SupportTickets' as const, id })),
              { type: 'SupportTickets', id: 'LIST' },
            ]
          : [{ type: 'SupportTickets', id: 'LIST' }],
    }),

    // Get my tickets
    getMyTickets: builder.query<ApiResponse<SupportTicket[]>, void>({
      query: () => ({
        url: '/support-tickets/my-tickets',
        method: 'get',
      }),
      providesTags: ['SupportTickets'],
    }),

    // Get ticket by ID
    getTicketById: builder.query<ApiResponse<SupportTicket>, string>({
      query: (id) => ({
        url: `/support-tickets/${id}`,
        method: 'get',
      }),
      providesTags: (_result, _error, id) => [{ type: 'SupportTickets', id }],
    }),

    // Get tickets by status
    getTicketsByStatus: builder.query<ApiResponse<SupportTicket[]>, string>({
      query: (status) => ({
        url: `/support-tickets/status/${status}`,
        method: 'get',
      }),
      providesTags: ['SupportTickets'],
    }),

    // Get ticket stats
    getTicketStats: builder.query<ApiResponse<TicketStats>, void>({
      query: () => ({
        url: '/support-tickets/stats',
        method: 'get',
      }),
      providesTags: ['SupportTickets'],
    }),

    // Create ticket
    createTicket: builder.mutation<ApiResponse<SupportTicket>, CreateTicketRequest>({
      query: (data) => ({
        url: '/support-tickets',
        method: 'post',
        data: {
          subject: data.subject,
          message: data.message ?? data.description,
          priority: data.priority,
          category: data.category,
          attachments: data.attachments,
        },
      }),
      invalidatesTags: [{ type: 'SupportTickets', id: 'LIST' }],
    }),

    // Update ticket
    updateTicket: builder.mutation<ApiResponse<SupportTicket>, { id: string; data: Partial<SupportTicket> }>({
      query: ({ id, data }) => ({
        url: `/support-tickets/${id}`,
        method: 'patch',
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'SupportTickets', id }],
    }),

    // Respond to ticket (admin)
    respondToTicket: builder.mutation<ApiResponse<SupportTicket>, { id: string; response: string; assignedToId?: string }>({
      query: ({ id, ...data }) => ({
        url: `/support-tickets/${id}/respond`,
        method: 'post',
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'SupportTickets', id }],
    }),

    // Resolve ticket
    resolveTicket: builder.mutation<ApiResponse<SupportTicket>, string>({
      query: (id) => ({
        url: `/support-tickets/${id}/resolve`,
        method: 'post',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'SupportTickets', id }],
    }),

    // Close ticket
    closeTicket: builder.mutation<ApiResponse<SupportTicket>, string>({
      query: (id) => ({
        url: `/support-tickets/${id}/close`,
        method: 'post',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'SupportTickets', id }],
    }),

    // Delete ticket
    deleteTicket: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/support-tickets/${id}`,
        method: 'delete',
      }),
      invalidatesTags: [{ type: 'SupportTickets', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useGetMyTicketsQuery,
  useGetTicketByIdQuery,
  useGetTicketsByStatusQuery,
  useGetTicketStatsQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useRespondToTicketMutation,
  useResolveTicketMutation,
  useCloseTicketMutation,
  useDeleteTicketMutation,
} = supportApi;
