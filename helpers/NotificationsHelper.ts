import * as Notifications from "expo-notifications";
import i18n from "../i18n/i18n";

//TODO: add data type
export function setNotification(data, seconds: number) {
  console.log("notificationHelper/setNotification data:", data);
  const schedulingOptions = {
    content: {
      title: data.title,
      body: data.status,
      data: {
        trackingNumber: data.trackingNumber,
        route: "Details",
        id: data.id,
        title: data.parcelTitle,
      },
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      color: "blue",
    },
    trigger: {
      seconds: seconds,
    },
  };
  // Notifications show only when app is not active.
  // (ie. another app being used or device's screen is locked)
  Notifications.scheduleNotificationAsync(schedulingOptions);
}
