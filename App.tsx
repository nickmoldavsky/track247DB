import React, { useEffect, useRef } from "react";
import { NavigationAction, NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Notifications from "expo-notifications";

import HomeScreen from "./screens/HomeScreen";
import NewParcelScreen from "./screens/NewParcelScreen";
import DetailsScreen from "./screens/DetailsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import LocationScreen from "./screens/LocationScreen";
import ScannerScreen from "./screens/ScannerScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";

import UserAccess from "./components/UserAccessComponent";

import { persistor, store } from "./store/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";


const Stack = createNativeStackNavigator();

export default function App({navigation}) {
  const globalScreenOptions = {
    headerStyle: { backgroundColor: "#2C6BED" },
    headerTitleStyle: { color: "white" },
    headerTintColor: "white",
  };

  //notification
  const navigationContainerRef = useRef<NavigationAction>();
  const lastNotificationResponse = Notifications.useLastNotificationResponse();
  //const navigation = useNavigation();

  useEffect(() => {
    //notification clicked
    if (lastNotificationResponse) {
      console.log("notification response:", lastNotificationResponse.notification.request.content);
      if (navigationContainerRef.current) {
        navigationContainerRef.current?.navigate("Details", {
          trackingNumber:
            lastNotificationResponse.notification.request.content.data
              .trackingNumber,
          trackingTitle:
            lastNotificationResponse.notification.request.content.data.title,
          id: lastNotificationResponse.notification.request.content.data.id,
        });
      }
      
    }
    //
  }, [lastNotificationResponse]);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer ref={navigationContainerRef}>
          <Stack.Navigator screenOptions={globalScreenOptions}>
            <Stack.Screen name="Home" component={HomeScreen} options={{animation: "none"}} />
            <Stack.Screen name="Login" component={LoginScreen} options={{animation: "none"}} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{animation: "none"}} />
            <Stack.Screen name="NewParcel" component={NewParcelScreen} options={{animation: "none"}} />
            <Stack.Screen name="Details" component={DetailsScreen} options={{animation: "none"}} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{animation: "none"}} />
            <Stack.Screen name="Location" component={LocationScreen} options={{animation: "none"}} />
            <Stack.Screen name="Scanner" component={ScannerScreen} options={{animation: "none"}} />
          </Stack.Navigator>
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
};
