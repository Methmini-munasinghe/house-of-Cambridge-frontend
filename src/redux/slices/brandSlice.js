import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosInstance';

const apiErr = (err) => err.response?.data?.message || err.response?.data?.error || err.message;

export const fetchBrands = createAsyncThunk(
  'brands/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const res = await api.get('/brands', { params });
      return res.data;
    } catch (err) { return rejectWithValue(apiErr(err)); }
  }
);

export const fetchBrand = createAsyncThunk(
  'brands/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/brands/${id}`);
      return res.data;
    } catch (err) { return rejectWithValue(apiErr(err)); }
  }
);

export const createBrand = createAsyncThunk(
  'brands/create',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post('/brands', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (err) { return rejectWithValue(apiErr(err)); }
  }
);

export const updateBrand = createAsyncThunk(
  'brands/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/brands/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (err) { return rejectWithValue(apiErr(err)); }
  }
);

export const deleteBrand = createAsyncThunk(
  'brands/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/brands/${id}`);
      return id;
    } catch (err) { return rejectWithValue(apiErr(err)); }
  }
);

const brandSlice = createSlice({
  name: 'brands',
  initialState: {
    brands:  [],
    brand:   null,
    loading: false,
    error:   null,
  },
  reducers: {
    clearBrandError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending,    (state)         => { state.loading = true;  state.error = null; })
      .addCase(fetchBrands.fulfilled,  (state, action) => { state.loading = false; state.brands = action.payload.brands; })
      .addCase(fetchBrands.rejected,   (state, action) => { state.loading = false; state.error  = action.payload; })
      .addCase(fetchBrand.pending,     (state)         => { state.loading = true;  state.error = null; })
      .addCase(fetchBrand.fulfilled,   (state, action) => { state.loading = false; state.brand  = action.payload.brand; })
      .addCase(fetchBrand.rejected,    (state, action) => { state.loading = false; state.error  = action.payload; })
      .addCase(createBrand.fulfilled,  (state, action) => { state.brands.unshift(action.payload.brand); })
      .addCase(updateBrand.fulfilled,  (state, action) => {
        const updated = action.payload.brand;
        state.brands  = state.brands.map((b) => b._id === updated._id ? updated : b);
      })
      .addCase(deleteBrand.fulfilled,  (state, action) => {
        state.brands = state.brands.filter((b) => b._id !== action.payload);
      });
  },
});

export const { clearBrandError } = brandSlice.actions;
export default brandSlice.reducer;