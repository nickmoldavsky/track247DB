import React, {
  useEffect,
  useState,
  useMemo,
  useLayoutEffect,
  useRef,
  MutableRefObject,
} from "react";
import {
  View,
  SafeAreaView,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  RefreshControl,
  AppState,
} from "react-native";
import { ListItem } from "react-native-elements";
import { Entypo, MaterialCommunityIcons } from "@expo/vector-icons/";
import LoadingComponent from "../components/LoadingComponent";
import DateTimeHelper from "../helpers/DateTimeHelper";
import CopyToClipboardHelper from "../helpers/CopyToClipboardHelper";
import { useAppSelector, useAppDispatch } from "../hooks/redux"; //redux types
import {
  getPackageInfo,
  checkTrackingStatus,
  addParcelToDb,
  updateParcelInDb,
} from "../store/parcelSlice";
//interfaces
import { IParcel, IRequestParams } from "../interfaces/parcel";
//styled theme
import { AppTheme } from "../styled/theme";
import i18n from "../i18n/i18n";
import { RootState } from "../store/store";
import { DetailsScreenProps } from "../types/types";
//maps
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
//sharing
import * as Sharing from "expo-sharing";
import FooterComponent from "../components/FooterComponent";
//test
import axios from "axios";

const DetailsScreen: React.FC = ({ route, navigation }: DetailsScreenProps) => {
  const trackingId = route.params?.trackingNumber;
  const parcelId = route.params?.id;
  const [parcelInfo, setParcelInfo] = useState<IParcel>();
  const [states, setStates] = useState<IParcel>();
  const [elementVisible, setElementVisible] = useState<boolean>(false);
  const errorMessage: string =
    i18n.t("PARCEL_DETAILS_ERROR_MESSAGE") + trackingId;
  const dispatch = useAppDispatch();
  const { uid } = useAppSelector((state) => state.user);
  const { items, isLoading, error } = useAppSelector((state) => state.parcel);
  const { theme, language, location, pushToken, deviceId } = useAppSelector(
    (state) => state.settings
  );
  // Constructing styles for current theme
  const styles: any = useMemo(() => createStyles(theme), [theme]); //TODO change <any> type
  const loadingIndicator: boolean = isLoading;
  const firstUpdate: MutableRefObject<boolean> = useRef(true);
  const fetchData: MutableRefObject<boolean> = useRef(false);
  //app state
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: route.params?.trackingTitle,
      headerTitleAlign: "left",
      headerBackTitleVisible: false,
      headerStyle: { backgroundColor: AppTheme[theme].header },
      headerRight: () => (
        <View style={[styles.headerRight, styles.row]}>
          <TouchableOpacity
            onPress={() =>
              Sharing.shareAsync(
                "https://docs.expo.dev/versions/latest/sdk/sharing/"
              )
            }
          >
            <MaterialCommunityIcons
              name="share-variant"
              size={24}
              color="white"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setElementVisible(!elementVisible)}>
            <Entypo name="dots-three-vertical" size={24} color="white" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [elementVisible, theme]);

  useEffect(() => {
    //Sharing.isAvailableAsync()

    if (firstUpdate.current) {
      firstUpdate.current = false;
    } else {
      if (
        (!parcelInfo?.status || parcelInfo?.status !== "delivered") &&
        !fetchData.current
      ) {
        fetchData.current = true;
        fetchParcelData();
      }
    }
    return () => {
      //TODO: abort request when living a page;
      //promise.abort();
    };
  }, []); //TODO check if

  useEffect(() => {
    fetchParcelData();
    AppState.addEventListener("change", _handleAppStateChange);
    return () => {
      //AppState.removeEventListener("change", _handleAppStateChange);
    };
  }, []);

  //TODO: change it
  useEffect(() => {
    console.log("DetailsScreen/useEffect/items", items.length);
    //updateParcelInfo(trackingId);
  }, [items]);

  const delay = async (ms: number) => new Promise((res) => setTimeout(res, ms));

  const _handleAppStateChange = (nextAppState) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      console.log("App has come to the foreground!");
    }

    appState.current = nextAppState;
    setAppStateVisible(appState.current);
    console.log("AppState", appState.current);
  };

  const fetchParcelData = async () => {
    const requestParams: IRequestParams = {
      trackingId,
      location,
      language,
    };
    const response = await dispatch(getPackageInfo(requestParams));
    console.log("DeatailsScreen/getPackageInfo/response:", response.payload);
    if (response.payload["uuid"]) {
      const status = await getStatus(response.payload["uuid"]);
    } else {
      console.log(
        "request getPackageInfo complete!",
        response.payload.shipments[0].states
      );
      //setParcelInfo(response.payload.shipments[0]);
      updateParcelInfo(response.payload.shipments[0]);
    }
  };

  // change it !!!
  const getStatus = async (uuid: string) => {
    const response = await dispatch(checkTrackingStatus(uuid));
    console.log(
      "DetailsScreen/dispatch(checkTrackingStatus)/setTimeout:",
      response.payload
    );

    if (response.payload === "NO_DATA") {
      return false;
    }

    if (response.payload["done"]) {
      console.log("DetailsScreen/getStatus/Request complete", response.payload);
      //setParcelInfo(response.payload.shipments[0]);
      updateParcelInfo(response.payload.shipments[0]);
      return response.payload;
    } else {
      console.log("delay 1sec..");
      await delay(1000);
      getStatus(uuid);
    }
  };

  const updateParcelInfo = (responseParcelInfo) => {
    setParcelInfo(responseParcelInfo);
    console.log('updateParcelInfo responseParcelInfo', responseParcelInfo.status);
    items.find((item) => {
      if (item.track_id === responseParcelInfo.trackingId) {
        console.log("DetailsScreen/updateParcelInfo/item by trackingId:", item);
        if(item?.status !== responseParcelInfo.status && uid) {
        //if(item?.lastState?.status !== responseParcelInfo.status && uid) {
          const requestData = {
            user_id: uid,
            track_id: responseParcelInfo.trackingId,
            status: responseParcelInfo.status,
            states: responseParcelInfo.states,
            last_status: responseParcelInfo.lastState,
          }
          dispatch(updateParcelInDb(requestData));
        }
        // setParcelInfo((prevParcelInfo) => {
        //   return (prevParcelInfo = item);
        // });

      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {error && (
        <View style={[styles.container, styles.center]}>
          <Text style={styles.text}>{errorMessage}</Text>
        </View>
      )}

      {/* {loadingIndicator && <LoadingComponent animation="wave" />} */}

      {!error && (
        <View>
          {/* <MapView style={styles.map} /> */}

          <View style={[styles.parcel, styles.row]}>
            <MaterialCommunityIcons
              name="package-variant-closed"
              size={24}
              color={AppTheme[theme].button}
            />
            <Text style={styles.statusText}>{trackingId}</Text>
            <MaterialCommunityIcons
              style={styles.copy}
              name="content-copy"
              size={16}
              onPress={() => CopyToClipboardHelper.copyToClipboard(trackingId)}
            />
          </View>

          {parcelInfo?.destination && (
            <View style={[styles.route, styles.row]}>
              <Text style={styles.statusText}>{parcelInfo?.origin}</Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={24}
                color={AppTheme[theme].text}
              />
              <Text style={styles.statusText}>{parcelInfo?.destination}</Text>
            </View>
          )}

          {parcelInfo?.status && (
            <View style={styles.status}>
              <Text style={styles.statusText}>
                {!parcelInfo?.status ? "" : i18n.t(parcelInfo?.status)}
              </Text>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    StyleSheet.absoluteFill,
                    {
                      backgroundColor: AppTheme[theme].button,
                      width:
                        parcelInfo?.status !== "delivered"
                          ? parcelInfo?.status !== "arrived"
                            ? "30%"
                            : "85%"
                          : "100%",
                    },
                  ]}
                />
              </View>
            </View>
          )}

          <View style={styles.loadingIndicator}>
            {loadingIndicator && <LoadingComponent animation="wave" />}
            {/* <ActivityIndicator
              animating={loadingIndicator}
              size="small"
              color={AppTheme[theme].button}
            />  */}
          </View>

          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={fetchParcelData}
                colors={[AppTheme[theme].button]}
                tintColor={AppTheme[theme].button}
                //enabled={!isLoading}
              />
            }
            style={styles.scrollView}
          >
            {parcelInfo?.states &&
              parcelInfo.states.map((state, index) => {
                return (
                  <ListItem
                    key={index}
                    bottomDivider
                    containerStyle={{
                      backgroundColor: AppTheme[theme].container,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="circle-double"
                      size={10}
                      color={AppTheme[theme].button}
                    />
                    <ListItem.Content>
                      <ListItem.Title style={styles.title}>
                        {state?.status}
                      </ListItem.Title>
                      <ListItem.Subtitle
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{ color: AppTheme[theme].title }}
                      >
                        <Text style={{ opacity: 0.5, marginRight: 5 }}>
                          {DateTimeHelper.getFormattedDatetime(state?.date)}
                        </Text>
                      </ListItem.Subtitle>
                    </ListItem.Content>
                    <Text style={{ color: AppTheme[theme].title }}>
                      {state?.location}
                    </Text>
                  </ListItem>
                );
              })}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};

const createStyles = (theme: string) =>
  StyleSheet.create({
    container: {
      backgroundColor: AppTheme[theme].container,
      flex: 1,
    },
    center: {
      justifyContent: "center",
      alignItems: "center",
    },
    headerRight: {},
    parcel: {
      margin: 10,
      alignItems: "center",
    },
    title: {
      fontWeight: "bold",
      fontSize: 14,
      color: AppTheme[theme].title,
    },
    text: {
      color: AppTheme[theme].text,
    },
    row: {
      flexDirection: "row",
    },
    loading: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      alignItems: "center",
      justifyContent: "center",
    },
    options: {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "100%",
      height: 200,
      backgroundColor: "red",
      alignItems: "center",
      justifyContent: "center",
    },
    status: {
      marginTop: 13,
      alignItems: "center",
      justifyContent: "center",
    },
    statusText: {
      fontSize: 18,
      color: AppTheme[theme].text,
    },
    progressBar: {
      width: "90%",
      height: 10,
      backgroundColor: "#FFF",
      borderWidth: 1,
      borderRadius: 8,
      borderColor: "#CCC",
      flexDirection: "row",
    },
    copy: {
      marginLeft: 10,
      color: AppTheme[theme].button,
    },
    route: {
      marginLeft: 15,
    },
    scrollView: {
      //backgroundColor: AppTheme[theme].container,
      minHeight: 100,
    },
    map: {
      width: "100%",
      height: 150,
    },
  });

export default DetailsScreen;
