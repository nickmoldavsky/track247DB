import { NativeStackScreenProps } from "@react-navigation/native-stack/lib/typescript/src/types";

export type RootStackParamList = {
  Home: undefined;
  Details: {
    trackingNumber: string;
    trackingTitle: string;
    id?: number;
    index?: number;
  };
  NewParcel: {
    action: string;
    id?: number;
    title?: string;
    trackingNumber?: string;
  };
  Settings: {};
  Location: {
    action: string;
  };
  Scanner: {

  }
};

export type DetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Details"
>;

export type LocationScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Location"
>;

export type ScannerScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Scanner"
>;

export type NewParcelScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "NewParcel"
>;

export type SettingsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Settings"
>;

export type UpdateParcelParams = {
  id: number;
  trackingNumber?: string;
  title?: string;
  action?: string;
  status?: string;
};

export type Notification = {
  id: number;
  parcelTitle: string;
  trackingNumber: string;
  title: string;
  status: string;
};

export type Item = {
  id: number;
  title: string;
  value: string;
};
