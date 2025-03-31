import {
  createSlice,
  createAsyncThunk,
  current,
  PayloadAction,
} from "@reduxjs/toolkit";
import { IUserState } from "../interfaces/state";
import axios from "axios";

const initialState: IUserState = {
  uid: "",
  uname: "",
  isLoading: false,
  error: "",
  updateItemsFlag: false,
};

const backendURL = "http://64.226.80.50:5000";

//login
export const userLogin = createAsyncThunk(
  "user/userLogin",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // configure header's Content-Type as JSON
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.post(
        `${backendURL}/api/v2/user/login`,
        { email, password },
        config
      );
      // store user's token in local storage
      //localStorage.setItem("userToken", data.userToken);
      return data;
    } catch (error) {
      // return custom error message from API if any
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

//register
export const userRegister = createAsyncThunk(
  "user/userRegister",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // configure header's Content-Type as JSON
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.post(
        `${backendURL}/api/v2/user/register`,
        { email, password },
        config
      );
      // store user's token in local storage
      //localStorage.setItem("userToken", data.userToken);
      return data;
    } catch (error) {
      // return custom error message from API if any
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setLocation: (state, action) => {
      state.location = action.payload;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    logIn: (state, action) => {
      state.uid = action.payload;
    },
    logOut: (state) => {
      state.uid = "";
      state.uname = "";
      state.error = "";
      //TODO: reset all state data
    },
  },
  extraReducers: (builder) => {
    //Login
    builder.addCase(userLogin.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(userLogin.fulfilled,(state, action) => {
      state.isLoading = false;
      console.log('userLogin payload', action.payload.data[0].email);
      state.uid = action.payload.data[0].id;
      state.uname = action.payload.data[0].email;
    });
    builder.addCase(userLogin.rejected, (state, action) => {
      state.isLoading = false;
      console.log('userLogin error', action.payload);
      //state.error = action.error.message;
      state.error = action.payload;
    });

    //Register
    builder.addCase(userRegister.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(userRegister.fulfilled,(state, action) => {
      state.isLoading = false;
      console.log('userRegister payload', action.payload.data);
      state.uid = action.payload.data.id;
      state.uname = action.payload.data.email;
    });
    builder.addCase(userRegister.rejected, (state, action) => {
      state.isLoading = false;
      console.log('userRegister error', action.payload);
      //state.error = action.error.message;
      state.error = action.payload;
    });

  },
});

export const { setLocation, setLanguage, logIn, logOut } = userSlice.actions;

export default userSlice.reducer;
