type States = {
  date: string;
  carrier: string;
  status: string;
  location?: string;
}

export interface IParcel {
  done?: boolean,
  id: number;
  uuid?: string;
  title: string;
  trackingNumber: string;
  status?: string;
  origin?: string;
  destination?: string;
  carriers?: string;
  action?: string; //TODO: remove it
  lastState?: States;
  states?: {
    date: string;
    carrier: string;
    status: string;
    location?: string;
  }[];
}

export interface IRequestParams {
  trackingId: string;
  location: string;
  language: string;
}

export interface INavigationParams {
  action?: string;
  id: number;
  trackingNumber?: string;
  title?: string;
}
