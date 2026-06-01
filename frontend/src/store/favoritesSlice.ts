import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from './index';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface FavoritesState {
  items: number[];
  loading: boolean;
}

const initialState: FavoritesState = {
  items: [],
  loading: false,
};

// Загрузить избранное с бэкенда
export const fetchFavorites = createAsyncThunk(
  'favorites/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/favorites`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('Failed to fetch favorites');
      const data = await response.json();
      return data.map((item: { id: number }) => item.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return rejectWithValue(message);
    }
  }
);

// Добавить в избранное
export const addToFavorites = createAsyncThunk(
  'favorites/add',
  async (knifeId: number, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/favorites/${knifeId}`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('Failed to add to favorites');
      dispatch(fetchFavorites());
      return knifeId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return rejectWithValue(message);
    }
  }
);

// Удалить из избранного
export const removeFromFavorites = createAsyncThunk(
  'favorites/remove',
  async (knifeId: number, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/favorites/${knifeId}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('Failed to remove from favorites');
      dispatch(fetchFavorites());
      return knifeId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return rejectWithValue(message);
    }
  }
);

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchFavorites.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchFavorites.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchFavorites.rejected, (state) => {
      state.loading = false;
    });
    builder.addCase(addToFavorites.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(addToFavorites.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(addToFavorites.rejected, (state) => {
      state.loading = false;
    });
    builder.addCase(removeFromFavorites.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(removeFromFavorites.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(removeFromFavorites.rejected, (state) => {
      state.loading = false;
    });
  },
});

export const selectFavorites = (state: RootState) => state.favorites.items;
export default favoritesSlice.reducer;