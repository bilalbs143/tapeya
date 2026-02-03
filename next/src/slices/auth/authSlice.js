import { createSlice } from '@reduxjs/toolkit';

import {
  fetchUserProfile,
  loginUser,
  logoutUser,
  registerUser,
  updateUserPassword,
  updateUserProfile,
} from './authAction';

const initialState = {
  isAuth: false,
  user: {},
  userLoader: false,
  loginLoader: false,
  logoutLoader: false,
  profileLoader: false,
  profileUpdateData: null,
  updatePasswordLoader: false,
  updatePasswordData: null,
  registerLoader: false,
  registerData: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setClearAuth(state) {
      state.user = {};
      state.isAuth = false;
      localStorage.removeItem('jwt');
    },
    updateUserWallet(state, action) {
      // Update the wallet data in the user object
      if (state.user && action.payload) {
        state.user = {
          ...state.user,
          wallet: {
            ...state.user.wallet,
            ...action.payload,
          },
        };
      }
    },
  },
  extraReducers: (builder) => {
    const handleAuthFulfilled = (state, action) => {
      // Handle new API response structure
      const userData = action.payload?.data?.user || {};
      const authData = action.payload?.data?.auth || {};
      const token = authData.access_token || null;

      state.user = userData;
      state.loginLoader = false;
      state.registerLoader = false;

      if (token) {
        localStorage.setItem('jwt', token);
        state.isAuth = true;
      }
    };

    const handleAuthRejected = (state) => {
      state.loginLoader = false;
      state.registerLoader = false;
      state.isAuth = false;
      localStorage.removeItem('jwt');
      state.user = {};
    };

    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.loginLoader = true;
      state.isAuth = false;
    });
    builder.addCase(loginUser.fulfilled, handleAuthFulfilled);
    builder.addCase(loginUser.rejected, handleAuthRejected);

    // Logout
    builder.addCase(logoutUser.pending, (state) => {
      state.logoutLoader = true;
      state.isAuth = false;
    });
    builder.addCase(logoutUser.fulfilled, handleAuthRejected);
    builder.addCase(logoutUser.rejected, handleAuthRejected);

    // Profile Management
    builder.addCase(updateUserProfile.pending, (state) => {
      state.profileLoader = true;
      state.profileUpdateData = null;
    });
    builder.addCase(updateUserProfile.fulfilled, (state, action) => {
      state.profileLoader = false;
      // Handle both old and new API response structures
      const profileData = action.payload?.data || action.payload;
      state.profileUpdateData = profileData || null;
      state.user = profileData ? { ...state.user, ...profileData } : state.user;
    });
    builder.addCase(updateUserProfile.rejected, (state) => {
      state.profileLoader = false;
      state.profileUpdateData = null;
    });

    // User Data
    builder.addCase(fetchUserProfile.pending, (state) => {
      state.userLoader = true;
    });
    builder.addCase(fetchUserProfile.fulfilled, (state, action) => {
      state.userLoader = false;
      // Handle both old and new API response structures
      const userData = action.payload?.data || action.payload;
      state.user = userData ? { ...state.user, ...userData } : state.user;
    });
    builder.addCase(fetchUserProfile.rejected, (state) => {
      state.userLoader = false;
    });

    // Password Management
    builder.addCase(updateUserPassword.pending, (state) => {
      state.updatePasswordLoader = true;
      state.updatePasswordData = null;
    });
    builder.addCase(updateUserPassword.fulfilled, (state) => {
      state.updatePasswordLoader = false;
    });
    builder.addCase(updateUserPassword.rejected, (state) => {
      state.updatePasswordLoader = false;
      state.updatePasswordData = null;
    });

    // Guest Register
    builder.addCase(registerUser.pending, (state) => {
      state.registerLoader = true;
      state.registerData = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.registerLoader = false;
      // Handle both old and new API response structures
      const registerData = action.payload?.data || action.payload;
      state.registerData = registerData || null;

      // If registration includes user data and auth, handle it like login
      if (action.payload?.data?.user && action.payload?.data?.auth) {
        const userData = action.payload.data.user;
        const authData = action.payload.data.auth;
        const token = authData.access_token || null;

        state.user = userData;

        if (token) {
          localStorage.setItem('jwt', token);
          state.isAuth = true;
        }
      }
    });
    builder.addCase(registerUser.rejected, (state) => {
      state.registerLoader = false;
      state.registerData = null;
    });
  },
});

export const { setClearAuth, updateUserWallet } = authSlice.actions;

export default authSlice.reducer;
