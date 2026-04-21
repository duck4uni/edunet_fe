import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery, API_BASE_URL } from './axiosBaseQuery';

export interface PersonalAssistantQuickAction {
  id: string;
  label: string;
  question: string;
  icon: string;
  enabled: boolean;
  order: number;
}

export interface PersonalAssistantIntentConfig {
  intent: string;
  label: string;
  description: string;
  examples: string[];
  enabled: boolean;
}

export const personalAssistantApi = createApi({
  reducerPath: 'personalAssistantApi',
  baseQuery: axiosBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['AssistantQuickActions', 'AssistantIntents'],
  endpoints: (builder) => ({
    askAssistant: builder.mutation<
      { success: boolean; data: { intent: string; answer: string; data: any } },
      { question: string }
    >({
      query: (body) => ({
        url: '/personal-assistant/ask',
        method: 'POST',
        data: body,
      }),
    }),

    getAssistantQuickActions: builder.query<
      { success: boolean; data: PersonalAssistantQuickAction[] },
      void
    >({
      query: () => ({
        url: '/personal-assistant/quick-actions',
        method: 'GET',
      }),
      providesTags: ['AssistantQuickActions'],
    }),

    getAssistantIntentConfigs: builder.query<
      { success: boolean; data: PersonalAssistantIntentConfig[] },
      void
    >({
      query: () => ({
        url: '/personal-assistant/admin/intents',
        method: 'GET',
      }),
      providesTags: ['AssistantIntents'],
    }),

    updateAssistantIntentConfig: builder.mutation<
      { success: boolean; data: PersonalAssistantIntentConfig },
      { intent: string; enabled?: boolean; description?: string; examples?: string[] }
    >({
      query: ({ intent, ...data }) => ({
        url: `/personal-assistant/admin/intents/${intent}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['AssistantIntents'],
    }),

    getAssistantQuickActionsAdmin: builder.query<
      { success: boolean; data: PersonalAssistantQuickAction[] },
      void
    >({
      query: () => ({
        url: '/personal-assistant/admin/quick-actions',
        method: 'GET',
      }),
      providesTags: ['AssistantQuickActions'],
    }),

    createAssistantQuickAction: builder.mutation<
      { success: boolean; data: PersonalAssistantQuickAction },
      { label: string; question: string; icon: string; enabled?: boolean; order?: number }
    >({
      query: (data) => ({
        url: '/personal-assistant/admin/quick-actions',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['AssistantQuickActions'],
    }),

    updateAssistantQuickAction: builder.mutation<
      { success: boolean; data: PersonalAssistantQuickAction },
      { id: string; label?: string; question?: string; icon?: string; enabled?: boolean; order?: number }
    >({
      query: ({ id, ...data }) => ({
        url: `/personal-assistant/admin/quick-actions/${id}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['AssistantQuickActions'],
    }),

    deleteAssistantQuickAction: builder.mutation<
      { success: boolean; data: { deleted: boolean } },
      { id: string }
    >({
      query: ({ id }) => ({
        url: `/personal-assistant/admin/quick-actions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AssistantQuickActions'],
    }),
  }),
});

export const {
  useAskAssistantMutation,
  useGetAssistantQuickActionsQuery,
  useGetAssistantIntentConfigsQuery,
  useUpdateAssistantIntentConfigMutation,
  useGetAssistantQuickActionsAdminQuery,
  useCreateAssistantQuickActionMutation,
  useUpdateAssistantQuickActionMutation,
  useDeleteAssistantQuickActionMutation,
} = personalAssistantApi;
