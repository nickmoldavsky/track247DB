import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ISettingsState } from "../interfaces/state";
import axios from "axios";

const initialState: ISettingsState = {
  darkmode: false,
  colors: {
    header: "#ebfbff",
    body: "#fff",
    footer: "#003333",
  },
  showDelivered: false,
  orderBy: "asc",
  theme: "light", //'light' or 'dark'
  location: "israel",
  language: "en",
  pushNotifications: false,
  //TODO: delete or move to user slice
  deviceId: "123456789",
  pushToken: "",
  accessToken: "iZIyhb_HpsiuVUs3AgjbFoUaMg39ug9Yw5uut1H-",
  isLoading: false,
  error: false,
};

const backendURL = "http://64.226.80.50:5000";

export const togglePushNotifications = createAsyncThunk(
  "settings/togglePushNotifications",
  async ({ id, flag }, { rejectWithValue }) => {
    try {
      console.log('settingsSlice flag:', flag);
      // configure header's Content-Type as JSON
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.post(
        `${backendURL}/api/v2/updatePushNotificationsFlag`,
        { id, flag },
        config
      );
      console.log('update push flag data', data);
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

export const setPushNotificationsToken = createAsyncThunk(
  "settings/setPushNotificationsToken",
  async ({ id, token }, { rejectWithValue }) => {
    try {
      console.log('setPushNotificationsToken push token:', token + "uid:" + id);
      // configure header's Content-Type as JSON
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.post(
        `${backendURL}/api/v2/updatePushNotificationsToken`,
        { id, token },
        config
      );
      console.log('update push token', data);
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

//update language
export const updateAppLanguage = createAsyncThunk(
  "settings/updateAppLanguage",
  async ({ id, language }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.post(
        `${backendURL}/api/v2/updateAppLanguage`,
        { id, language },
        config
      );
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

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    //setListOrder: (state, action) => {
    //state.orderBy = [...state.orderBy, action.payload];
    //},
    resetSettings: (state) => {
      state.pushToken = "";
    },
    setLanguage: (state, action) => {
      //state.language = action.payload;
    },
    setLocation: (state, action) => {
      state.location = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setDarkTheme(state) {
      state.colors.header = "#324B50";
      state.colors.body = "#445155";
      state.darkmode = true;
      state.theme = "dark";
    },
    setDefaultTheme(state) {
      state.colors.header = "#ebfbff";
      state.colors.body = "#fff";
      state.darkmode = false;
      state.theme = "light";
    },
    setPushToken: (state, action) => {
      state.pushToken = action.payload;
      //TODO: update push token in DB
    },
    setDeviceId: (state, action) => {
      state.deviceId = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(togglePushNotifications.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(
      togglePushNotifications.fulfilled, (state, action) => {
        console.log('togglePushNotifications.fulfilled:', action.payload);
        state.pushNotifications = action.payload.data;
      }
    );
    builder.addCase(togglePushNotifications.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message;
    });

    //setPushNotificationsToken
    builder.addCase(setPushNotificationsToken.pending, (state) => {
      state.isLoading = true;
      state.error = null
    });
    builder.addCase(setPushNotificationsToken.fulfilled, (state, action) => {
        console.log('setPushNotificationsToken.fulfilled:', action.payload);
        //state.pusToken = action.payload.data;
      }
    );
    builder.addCase(setPushNotificationsToken.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message;
    });

    //update language
    builder.addCase(updateAppLanguage.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(updateAppLanguage.fulfilled,(state, action) => {
      state.isLoading = false;
      console.log('updateUserLanguage payload', action.payload.data);
      state.language = action.payload.data;
    });
    builder.addCase(updateAppLanguage.rejected, (state, action) => {
      state.isLoading = false;
      console.log('userRegister error', action.payload);
      state.error = action.error.message;
    });
  },
});

export const {
  resetSettings,
  setLanguage,
  setLocation,
  setTheme,
  setDarkTheme,
  setDefaultTheme,
  setPushToken,
  setDeviceId,
} = settingsSlice.actions;

export default settingsSlice.reducer;
