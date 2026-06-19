import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosInstance';

const apiErr = (err) => err.response?.data?.message || err.response?.data?.error || err.message;

export const createOrder = createAsyncThunk(
  'orders/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post('/orders', data);
      return res.data;
    } catch (err) { return rejectWithValue(apiErr(err)); }
  }
);

export const fetchMyOrders = createAsyncThunk(
  'orders/myOrders',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/orders/my-orders');
      return res.data;
    } catch (err) { return rejectWithValue(apiErr(err)); }
  }
);

export const fetchOrder = createAsyncThunk(
  'orders/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/orders/${id}`);
      return res.data;
    } catch (err) { return rejectWithValue(apiErr(err)); }
  }
);

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

const orderSlice = createSlice({
  name: 'orders',
  initialState: { orders: [], order: null, loading: false, error: null },
  reducers: {
    clearOrderError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending,      (state)         => { state.loading = true;  state.error = null; })
      .addCase(createOrder.fulfilled,    (state, action) => { state.loading = false; state.order = deepDecode(action.payload.order); })
      .addCase(createOrder.rejected,     (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchMyOrders.pending,    (state)         => { state.loading = true;  state.error = null; })
      .addCase(fetchMyOrders.fulfilled,  (state, action) => { state.loading = false; state.orders = deepDecode(action.payload.orders); })
      .addCase(fetchMyOrders.rejected,   (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchOrder.pending,       (state)         => { state.loading = true;  state.error = null; })
      .addCase(fetchOrder.fulfilled,     (state, action) => { state.loading = false; state.order = deepDecode(action.payload.order); })
      .addCase(fetchOrder.rejected,      (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearOrderError } = orderSlice.actions;
export default orderSlice.reducer;