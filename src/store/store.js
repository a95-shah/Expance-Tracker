import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import transactionReducer from '../features/transactions/transactionSlice';
import themeReducer from '../features/ui/themeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }),
});