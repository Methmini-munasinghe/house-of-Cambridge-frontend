import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosInstance';

const TOKEN_KEY = 'token';

const apiErr = (err) =>
  (typeof err.response?.data?.message === 'string'
    ? err.response.data.message
    : typeof err.response?.data?.error === 'string'
      ? err.response.data.error
      : typeof err.message === 'string'
        ? err.message
        : 'Something went wrong'
  ).replace(/[<>]/g, '').slice(0, 500);

const storeToken = (token) => {
  try {
    if (typeof token === 'string' && token.length > 0) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  } catch { /* storage unavailable */ }
};

const clearToken = () => {
  try { localStorage.removeItem(TOKEN_KEY); } catch { /* storage unavailable */ }
};

const readToken = () => {
  try { return localStorage.getItem(TOKEN_KEY) || null; } catch { return null; }
};

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data);
    return res.data;
  } catch (err) { return rejectWithValue(apiErr(err)); }
});

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', data);
    if (res.data.token) storeToken(res.data.token);
    return res.data;
  } catch (err) { return rejectWithValue(apiErr(err)); }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout');
  } catch (err) {
    return rejectWithValue(apiErr(err));
  } finally {
    clearToken();
  }
});

export const loadUser = createAsyncThunk('auth/loadUser', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/me');
    return res.data;
  } catch (err) { return rejectWithValue(apiErr(err)); }
});

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (email, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  } catch (err) { return rejectWithValue(apiErr(err)); }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async ({ token, password }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/auth/reset-password/${encodeURIComponent(token)}`, { password });
    if (res.data.token) storeToken(res.data.token);
    return res.data;
  } catch (err) { return rejectWithValue(apiErr(err)); }
});

export const verifyEmail = createAsyncThunk('auth/verifyEmail', async (token, { rejectWithValue }) => {
  try {
    const res = await api.get(`/auth/verify-email/${encodeURIComponent(token)}`);
    if (res.data.token) storeToken(res.data.token);
    return res.data;
  } catch (err) { return rejectWithValue(apiErr(err)); }
});

export const updatePassword = createAsyncThunk('auth/updatePassword', async (data, { rejectWithValue }) => {
  try {
    const res = await api.put('/auth/update-password', data);
    return res.data;
  } catch (err) { return rejectWithValue(apiErr(err)); }
});

export const googleLogin = createAsyncThunk('auth/googleLogin', async (accessToken, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/google', { accessToken });
    if (res.data.token) storeToken(res.data.token);
    return res.data;
  } catch (err) { return rejectWithValue(apiErr(err)); }
});

export const facebookLogin = createAsyncThunk('auth/facebookLogin', async (accessToken, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/facebook', { accessToken });
    if (res.data.token) storeToken(res.data.token);
    return res.data;
  } catch (err) { return rejectWithValue(apiErr(err)); }
});

const pending  = (state) => { state.loading = true; state.error = null; };
const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: readToken(),
    loading: false,
    error: null,
    message: null,
    isAuthenticated: false,
  },
  reducers: {
    clearAuthError:   (state) => { state.error = null; },
    clearAuthMessage: (state) => { state.message = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, pending)
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.message = typeof action.payload.message === 'string'
          ? action.payload.message
          : null;
      })
      .addCase(register.rejected, rejected)

      .addCase(login.pending, pending)
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user ?? null;
        state.token = action.payload.token ?? null;
        state.isAuthenticated = !!action.payload.user;
      })
      .addCase(login.rejected, rejected)

      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(logout.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })

      .addCase(loadUser.pending, (state) => { state.loading = true; })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user ?? null;
        state.isAuthenticated = !!action.payload.user;
      })
      .addCase(loadUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })

      .addCase(forgotPassword.pending, pending)
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = typeof action.payload.message === 'string'
          ? action.payload.message
          : null;
      })
      .addCase(forgotPassword.rejected, rejected)

      .addCase(resetPassword.pending, pending)
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user ?? null;
        state.token = action.payload.token ?? null;
        state.isAuthenticated = !!action.payload.user;
      })
      .addCase(resetPassword.rejected, rejected)

      .addCase(verifyEmail.pending, pending)
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user ?? null;
        state.token = action.payload.token ?? null;
        state.isAuthenticated = !!action.payload.user;
      })
      .addCase(verifyEmail.rejected, rejected)

      .addCase(updatePassword.pending, pending)
      .addCase(updatePassword.fulfilled, (state) => {
        state.loading = false;
        state.message = 'Password updated successfully';
      })
      .addCase(updatePassword.rejected, rejected)

      .addCase(googleLogin.pending, pending)
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user ?? null;
        state.token = action.payload.token ?? null;
        state.isAuthenticated = !!action.payload.user;
      })
      .addCase(googleLogin.rejected, rejected)

      .addCase(facebookLogin.pending, pending)
      .addCase(facebookLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user ?? null;
        state.token = action.payload.token ?? null;
        state.isAuthenticated = !!action.payload.user;
      })
      .addCase(facebookLogin.rejected, rejected);
  },
});

export const { clearAuthError, clearAuthMessage } = authSlice.actions;
export default authSlice.reducer;