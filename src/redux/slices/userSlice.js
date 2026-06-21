import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosInstance';

const apiErr = (err) => err.response?.data?.message || err.response?.data?.error || err.message;

export const fetchProfile = createAsyncThunk(
  'user/profile',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/users/profile');
      return res.data;
    } catch (err) { return rejectWithValue(apiErr(err)); }
  }
);

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.put('/users/profile', data);
      return res.data;
    } catch (err) { return rejectWithValue(apiErr(err)); }
  }
);

export const fetchAddresses = createAsyncThunk(
  'user/addresses',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/users/addresses');
      return res.data;
    } catch (err) { return rejectWithValue(apiErr(err)); }
  }
);

export const addAddress = createAsyncThunk(
  'user/addAddress',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post('/users/addresses', data);
      return res.data;
    } catch (err) { return rejectWithValue(apiErr(err)); }
  }
);

export const updateAddress = createAsyncThunk(
  'user/updateAddress',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/users/addresses/${id}`, data);
      return res.data;
    } catch (err) { return rejectWithValue(apiErr(err)); }
  }
);

export const deleteAddress = createAsyncThunk(
  'user/deleteAddress',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/users/addresses/${id}`);
      return id;
    } catch (err) { return rejectWithValue(apiErr(err)); }
  }
);

export const fetchWishlist = createAsyncThunk(
  'user/wishlist',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/users/wishlist');
      return res.data;
    } catch (err) { return rejectWithValue(apiErr(err)); }
  }
);

export const toggleWishlist = createAsyncThunk(
  'user/toggleWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      const res = await api.post('/users/wishlist/toggle', { productId });
      return res.data;
    } catch (err) { return rejectWithValue(apiErr(err)); }
  }
);

export const fetchNotifications = createAsyncThunk(
  'user/notifications',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/users/notifications');
      return res.data;
    } catch (err) { return rejectWithValue(apiErr(err)); }
  }
);

export const markNotificationRead = createAsyncThunk(
  'user/markNotificationRead',
  async (id, { rejectWithValue }) => {
    try {
      await api.put(`/users/notifications/${id}/read`);
      return id;
    } catch (err) { return rejectWithValue(apiErr(err)); }
  }
);

const setPending  = (state)         => { state.loading = true;  state.error = null; };
const setRejected = (state, action) => { state.loading = false; state.error = action.payload; };

const decodeEntity = (str) => {
  if (typeof str !== 'string') return str;
  const entities = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>',
    '&quot;': '"', '&#39;': "'", '&#x27;': "'",
    '&#x2F;': '/', '&#x2f;': '/'
  };
  return str.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&#x27;|&#x2[fF];|&#(\d+);|&#x([0-9a-fA-F]+);/g, (match, dec, hex) => {
    if (entities[match]) return entities[match];
    if (dec) return String.fromCharCode(dec);
    if (hex) return String.fromCharCode(parseInt(hex, 16));
    return match;
  });
};

const deepDecode = (obj) => {
  if (typeof obj === 'string') return decodeEntity(obj);
  if (Array.isArray(obj)) return obj.map(deepDecode);
  if (obj !== null && typeof obj === 'object') {
    const decoded = {};
    for (const key in obj) {
      decoded[key] = deepDecode(obj[key]);
    }
    return decoded;
  }
  return obj;
};

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile:       null,
    addresses:     [],
    wishlist:      [],
    notifications: [],
    loading:       false,
    error:         null,
    message:       null,
  },
  reducers: {
    clearUserError:   (state) => { state.error   = null; },
    clearUserMessage: (state) => { state.message = null; },
  },
  extraReducers: (builder) => {
    const allThunks = [
      fetchProfile, updateProfile, fetchAddresses, addAddress,
      updateAddress, deleteAddress, fetchWishlist, toggleWishlist,
      fetchNotifications, markNotificationRead,
    ];

    allThunks.forEach((thunk) => {
      builder
        .addCase(thunk.pending,  setPending)
        .addCase(thunk.rejected, setRejected);
    });

    builder
      .addCase(fetchProfile.fulfilled,        (state, action) => { state.loading = false; state.profile       = deepDecode(action.payload.user); })
      .addCase(updateProfile.fulfilled,       (state, action) => { state.loading = false; state.profile       = deepDecode(action.payload.user); state.message = 'Profile updated'; })
      .addCase(fetchAddresses.fulfilled,      (state, action) => { state.loading = false; state.addresses     = deepDecode(action.payload.addresses) || []; })
      .addCase(addAddress.fulfilled,          (state, action) => { state.loading = false; state.addresses.push(deepDecode(action.payload.address)); })
      .addCase(updateAddress.fulfilled,       (state, action) => {
        state.loading = false;
        const idx = state.addresses.findIndex((a) => a._id === action.payload.address._id);
        if (idx !== -1) state.addresses[idx] = deepDecode(action.payload.address);
      })
      .addCase(deleteAddress.fulfilled,       (state, action) => { state.loading = false; state.addresses     = state.addresses.filter((a) => a._id !== action.payload); })
      .addCase(fetchWishlist.fulfilled,       (state, action) => { state.loading = false; state.wishlist      = action.payload.wishlist?.products || []; })
      .addCase(toggleWishlist.fulfilled,      (state, action) => { state.loading = false; state.wishlist      = action.payload.wishlist?.products || []; })
      .addCase(fetchNotifications.fulfilled,  (state, action) => { state.loading = false; state.notifications = action.payload.notifications; })
      .addCase(markNotificationRead.fulfilled,(state, action) => {
        state.loading = false;
        const n = state.notifications.find((n) => n._id === action.payload);
        if (n) n.isRead = true;
      });
  },
});

export const { clearUserError, clearUserMessage } = userSlice.actions;
export default userSlice.reducer;