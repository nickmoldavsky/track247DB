import { IParcel } from "./parcel";

export interface IParcelState {
  items: IParcel[];
  isLoading: boolean;
  error: boolean | string;
  updateStateFlag: boolean;
  cancelRequest: boolean;
}

export interface IUserState {
  uid: string;
  uname: string;
  isLoading: boolean;
  error: string;
  updateItemsFlag: boolean;
}

export interface ISettingsState {
  darkmode: boolean;
  colors?: {
    header: string;
    body: string;
    footer: string;
  };
  showDelivered: boolean;
  orderBy: string;
  theme: string;
  language: string;
  pushNotifications: boolean;
  location: string;
  deviceId: string;
  pushToken: string;
  accessToken: string;
  isLoading: boolean;
  error: (boolean | string);
}
