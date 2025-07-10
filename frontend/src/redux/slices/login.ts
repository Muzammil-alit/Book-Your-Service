import { UserAttributes } from '@/utils/constants';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  admin: {
    user: UserAttributes | null;
    token: string | null;
  };
  client: {
    user: UserAttributes | null;
    token: string | null;
  };
  carer: {
    user: UserAttributes | null;
    token: string | null;
  };
}

const initialState: AuthState = {
  admin: {
    user: null,
    token: null
  },
  client: {
    user: null,
    token: null
  },
  carer: {
    user: null,
    token: null
  }
}

const authSlice = createSlice({
  name: 'authmodel',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ data: { user: UserAttributes, token: string } }>) => {
      const { user, token } = action.payload.data;
      if (user.userType === 1) {
        state.admin = { user, token };
      } else if (user.userType === 2) {
        state.client = { user, token };
      } else if (user.userType === 3) {
        state.carer = { user, token };
      }
    },


    updateProfile: (state, action: PayloadAction<{
      firstName: string;
      lastName: string;
      emailID: string;
      phoneNumber?: string;
    }>) => {
      const { firstName, lastName, emailID, phoneNumber } = action.payload;
      const userData = {
        firstName,
        lastName,
        emailID,
        phoneNumber
      };

      // Get userType from sessionStorage
      const userType = Number(sessionStorage.getItem('userType'));

      switch (userType) {
        case 1: // Admin
          state.admin.user = state.admin.user ? { ...state.admin.user, ...userData } : null;
          break;
        case 2: // Client
          state.client.user = state.client.user ? { ...state.client.user, ...userData } : null;
          break;
        case 3: // Carer
          state.carer.user = state.carer.user ? { ...state.carer.user, ...userData } : null;
          break;
        default:
          console.warn('Unknown user type or not logged in');
      }
    },



    logoutfn: (state, action: PayloadAction<number | undefined>) => {
      // If userType is provided, logout specific user type
      // If not provided, logout all
      const userType = action.payload;

      setTimeout(() => {
        if (userType === undefined) {
          state.admin = { user: null, token: null };
          state.client = { user: null, token: null };
          state.carer = { user: null, token: null };
        } else if (userType === 1) {
          state.admin = { user: null, token: null };
        } else if (userType === 2) {
          state.client = { user: null, token: null };
        } else if (userType === 3) {
          state.carer = { user: null, token: null };
        }
      }, 1000);
    }
  }
})

export const { login, updateProfile, logoutfn } = authSlice.actions;
export default authSlice.reducer;