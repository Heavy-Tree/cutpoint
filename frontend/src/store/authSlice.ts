import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../services/api';
import { getCurrentUser, login as loginApi, register as registerApi, removeToken } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,
};

// Асинхронный thunk для загрузки текущего пользователя
export const fetchCurrentUser = createAsyncThunk<User | null, void>(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await getCurrentUser();
      return user;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return rejectWithValue(message);
    }
  }
);

// Асинхронный thunk для логина
export const login = createAsyncThunk<User, { email: string; password: string }>(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const user = await loginApi(email, password);
      return user;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';
      return rejectWithValue(message);
    }
  }
);

// Асинхронный thunk для регистрации
export const register = createAsyncThunk<User, { email: string; password: string; name: string }>(
  'auth/register',
  async ({ email, password, name }, { rejectWithValue }) => {
    try {
      const user = await registerApi(email, password, name);
      return user;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      removeToken();
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Логин
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.token = localStorage.getItem('token');
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Регистрация
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.token = localStorage.getItem('token');
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Загрузка текущего пользователя
    builder.addCase(fetchCurrentUser.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
    });
    builder.addCase(fetchCurrentUser.rejected, (state) => {
      state.isLoading = false;
      state.user = null;
      state.token = null;
      removeToken();
    });
  },
});

export const { logout, setToken, setUser } = authSlice.actions;
export default authSlice.reducer;