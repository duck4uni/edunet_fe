import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery, API_BASE_URL } from './axiosBaseQuery';

// Chatbot uses BFF gateway prefix (same as Swagger)
const CHATBOT_BASE_URL = API_BASE_URL.replace(/\/api$/, '/gateway/edunet/api');

export interface ChatData {
  id: string;
  title: string;
  content: string;
  fileType: string;
  htmlContent?: string;
  imageCount: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatDataListResponse {
  data: {
    rows: ChatData[];
    count: number;
  };
}

export interface AskChatbotRequest {
  question: string;
}

export interface AskChatbotResponse {
  answer: string;
  references: ChatData[];
}

export interface CreateChatDataRequest {
  title: string;
  content: string;
  fileType?: string;
  htmlContent?: string;
  imageCount?: number;
  date?: string;
}

export type GenerateContentType = 'material' | 'assignment';

export interface GenerateCourseContentRequest {
  contentType: GenerateContentType;
  courseTitle: string;
  courseDescription?: string;
  requirement?: string;
}

export interface GeneratedMaterialSuggestion {
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'document' | 'link' | 'image';
  size: string;
  downloadUrl: string;
  isVisible: boolean;
}

export interface GeneratedAssignmentSuggestion {
  title: string;
  description: string;
  dueDate: string;
  maxGrade: number;
  isVisible: boolean;
}

export interface GenerateCourseContentResponse {
  suggestion: GeneratedMaterialSuggestion | GeneratedAssignmentSuggestion;
}

export const chatbotApi = createApi({
  reducerPath: 'chatbotApi',
  baseQuery: axiosBaseQuery({ baseUrl: CHATBOT_BASE_URL }),
  tagTypes: ['ChatData'],
  endpoints: (builder) => ({
    askChatbot: builder.mutation<{ data: AskChatbotResponse }, AskChatbotRequest>({
      query: (body) => ({ url: '/chatbot/ask', method: 'post', data: body }),
    }),
    generateCourseContent: builder.mutation<
      { data: GenerateCourseContentResponse },
      GenerateCourseContentRequest
    >({
      query: (body) => ({
        url: '/chatbot/generate-content',
        method: 'post',
        data: body,
      }),
    }),
    getChatDataList: builder.query<ChatDataListResponse, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: `/chatbot?page=${page}&limit=${limit}`,
        method: 'get',
      }),
      providesTags: [{ type: 'ChatData', id: 'LIST' }],
    }),
    createChatData: builder.mutation<{ data: ChatData }, CreateChatDataRequest>({
      query: (body) => ({ url: '/chatbot', method: 'post', data: body }),
      invalidatesTags: [{ type: 'ChatData', id: 'LIST' }],
    }),
    updateChatData: builder.mutation<{ data: ChatData }, { id: string; body: Partial<CreateChatDataRequest> }>({
      query: ({ id, body }) => ({ url: `/chatbot/${id}`, method: 'patch', data: body }),
      invalidatesTags: [{ type: 'ChatData', id: 'LIST' }],
    }),
    deleteChatData: builder.mutation<void, string>({
      query: (id) => ({ url: `/chatbot/${id}`, method: 'delete' }),
      invalidatesTags: [{ type: 'ChatData', id: 'LIST' }],
    }),
  }),
});

export const {
  useAskChatbotMutation,
  useGenerateCourseContentMutation,
  useGetChatDataListQuery,
  useCreateChatDataMutation,
  useUpdateChatDataMutation,
  useDeleteChatDataMutation,
} = chatbotApi;
