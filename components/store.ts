import { configureStore } from '@reduxjs/toolkit';
import quizReducer from './slices/quizSlice';

export const store = configureStore({
  reducer: {
    quiz: quizReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;