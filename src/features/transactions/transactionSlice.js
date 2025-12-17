
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../../config/firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';

export const addTransaction = createAsyncThunk(
  'transactions/add',
  async ({ transaction, uid }) => {
    const docRef = await addDoc(collection(db, 'transactions'), {
      ...transaction,
      uid,
      date: transaction.date, 
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...transaction };
  }
);

// yahan sa hum na delete funcionality ko component me use karenge undo ke liye
export const deleteTransaction = createAsyncThunk(
  'transactions/delete',
  async (id) => {
    await deleteDoc(doc(db, 'transactions', id));
    return id;
  }
);

const transactionSlice = createSlice({
  name: 'transactions',
  initialState: {
    items: [],
    status: 'idle',
    filter: { category: 'All', search: '' },
    lastDeletedTransaction: null, 
  },
  reducers: {
    setTransactions: (state, action) => {
      state.items = action.payload;
    },
    setFilter: (state, action) => {
      state.filter = { ...state.filter, ...action.payload };
    },
   
    setLastDeleted: (state, action) => {
      state.lastDeletedTransaction = action.payload;
    },
    clearLastDeleted: (state) => {
      state.lastDeletedTransaction = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(deleteTransaction.fulfilled, (state, action) => {
      });
  }
});

export const { setTransactions, setFilter, setLastDeleted, clearLastDeleted } = transactionSlice.actions;
export default transactionSlice.reducer;