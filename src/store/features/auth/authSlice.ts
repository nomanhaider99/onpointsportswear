import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiMessage, authApi, setStoredToken, type AuthUser } from "@/lib/api/client";

type AuthState = {
  token: string;
  user: AuthUser | null;
  loading: boolean;
  error: string;
};

const initialState: AuthState = {
  token: "",
  user: null,
  loading: false,
  error: "",
};

export const bootstrapAuth = createAsyncThunk("auth/bootstrap", async () => {
  const token = typeof window === "undefined" ? "" : window.localStorage.getItem("op-auth-token") || "";
  if (!token) return { token: "", user: null as AuthUser | null };
  try {
    const data = await authApi.me(token);
    return { token, user: data.user || (data as unknown as AuthUser) };
  } catch {
    setStoredToken("");
    return { token: "", user: null as AuthUser | null };
  }
});

export const login = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await authApi.login(payload.email, payload.password);
      setStoredToken(data.token);
      return data;
    } catch (error) {
      return rejectWithValue(apiMessage(error, "Could not sign in"));
    }
  },
);

export const register = createAsyncThunk(
  "auth/register",
  async (body: Record<string, unknown>, { rejectWithValue }) => {
    try {
      const data = await authApi.register(body);
      if (data.token) setStoredToken(data.token);
      return data;
    } catch (error) {
      return rejectWithValue(apiMessage(error, "Could not register"));
    }
  },
);

export const forgotPassword = createAsyncThunk("auth/forgot", async (email: string, { rejectWithValue }) => {
  try {
    return await authApi.forgotPassword(email);
  } catch (error) {
    return rejectWithValue(apiMessage(error, "Could not send reset email"));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = "";
      state.user = null;
      setStoredToken("");
    },
    clearAuthError(state) {
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload || "Could not sign in");
      })
      .addCase(register.fulfilled, (state, action) => {
        state.token = action.payload.token || state.token;
        state.user = action.payload.user || state.user;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
