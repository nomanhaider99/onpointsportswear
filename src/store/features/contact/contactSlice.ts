import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiMessage, contactApi } from "@/lib/api/client";

type ContactPayload = {
  name: string;
  email: string;
  phone: string;
  interestedIn: string;
  message: string;
};

export const submitContact = createAsyncThunk(
  "contact/submit",
  async (values: ContactPayload, { rejectWithValue }) => {
    try {
      return await contactApi.submit({ ...values, source: "website" });
    } catch (error) {
      return rejectWithValue(apiMessage(error, "Could not send message"));
    }
  },
);

const contactSlice = createSlice({
  name: "contact",
  initialState: { loading: false, error: "", success: false },
  reducers: {
    resetContact(state) {
      state.loading = false;
      state.error = "";
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitContact.pending, (state) => {
        state.loading = true;
        state.error = "";
        state.success = false;
      })
      .addCase(submitContact.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(submitContact.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload || "Could not send message");
      });
  },
});

export const { resetContact } = contactSlice.actions;
export default contactSlice.reducer;
