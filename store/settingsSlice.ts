import { createSlice } from "@reduxjs/toolkit";
import { ISettingsState } from "../interfaces/state";

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
  //TODO: delete or move to user slice
  deviceId: "123456789",
  pushToken: "",
  accessToken: "iZIyhb_HpsiuVUs3AgjbFoUaMg39ug9Yw5uut1H-",
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    //setListOrder: (state, action) => {
    //state.orderBy = [...state.orderBy, action.payload];
    //},
    setLanguage: (state, action) => {
      state.language = action.payload;
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
    },
    setDeviceId: (state, action) => {
      state.deviceId = action.payload;
    },
  },
});

export const { setLanguage, setLocation, setTheme, setDarkTheme, setDefaultTheme, setPushToken, setDeviceId } =
  settingsSlice.actions;

export default settingsSlice.reducer;
