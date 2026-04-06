import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from '../services/api';
import { authApi } from '../services/authApi';
import { courseApi } from '../services/courseApi';
import { learningApi } from '../services/learningApi';
import { supportApi } from '../services/supportApi';
import { userApi } from '../services/userApi';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [courseApi.reducerPath]: courseApi.reducer,
    [learningApi.reducerPath]: learningApi.reducer,
    [supportApi.reducerPath]: supportApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(api.middleware)
      .concat(authApi.middleware)
      .concat(courseApi.middleware)
      .concat(learningApi.middleware)
      .concat(supportApi.middleware)
      .concat(userApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
