import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery, API_BASE_URL } from './axiosBaseQuery';

export const personalAssistantApi = createApi({
  reducerPath: 'personalAssistantApi',
  baseQuery: axiosBaseQuery({ baseUrl: API_BASE_URL }),
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
  }),
});

export const { useAskAssistantMutation } = personalAssistantApi;
