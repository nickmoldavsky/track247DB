import React, { useEffect, useLayoutEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Platform,
  Pressable,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from "react-native";
//i18n
import * as Localization from "expo-localization";
import i18n from "../i18n/i18n";
//store
import { useSelector, useDispatch } from "react-redux";
import { setDarkTheme, setDefaultTheme } from "../store/settingsSlice";
//components
import NotificationsComponent from "../components/NotificationsComponent";
//theme
//import { ThemeProvider } from "styled-components";
import styled from "styled-components/native";
import { AppTheme } from "../styled/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons/";
import FooterComponent from "../components/FooterComponent";
import { RootState } from "../store/store";
import { SettingsScreenProps } from "../types/types";
import Constants from "expo-constants";
import { logOut } from "../store/userSlice";
import { resetItems } from "../store/parcelSlice";
import { useIsFocused } from "@react-navigation/native";
//import parse from 'html-react-parser';

const SettingsScreen: React.FC = ({ navigation }: SettingsScreenProps) => {
  const version = Constants.expoConfig.version;
  const dispatch = useDispatch();
  const { theme, colors, darkmode, language, location, pushToken, deviceId } = useSelector(
    (state: RootState) => state.settings
  );
  const { uid } = useSelector((state: RootState) => state.user
  );
  const user = uid;
  const Container = styled.View`
    background-color: ${darkmode ? "#000" : "#fff"};
  `;

  //i18n
  let deviceLanguage = Localization.locale.replace(/-US/g, "").toLowerCase();
  if (!deviceLanguage || (deviceLanguage !== "en" && deviceLanguage !== "ru")) {
    deviceLanguage = "en";
  } else {
    //set app language
  }
  i18n.locale = language;
  //i18n.defaultLocale

  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [darkThemeIsEnabled, setDarkThemeIsEnabled] =
    useState<boolean>(darkmode);
  const [archiveParcelIsEnabled, setArchiveParcelIsEnabled] =
    useState<boolean>(true);
  const styles = useMemo(() => createStyles(theme), [theme]);
  //const [locationInfo, setLocationInfo] = useState([]);

  //const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
  const INDEX = 0;
  const isFocused = useIsFocused();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: i18n.t("SETTINGS"),
      headerStyle: {
        backgroundColor: AppTheme[theme].header,
      },
    });
  }, [language, theme]);

  useEffect(() => {
    if(!uid) {
      navigation.navigate("Login");
    }
  }, [isFocused]);

  //menu list
  const SETTINGS_DATA = [
    {
      id: "1",
      title: i18n.t("APP_LANGUAGE"),
      onPress: { action: "SET_LANGUAGE" },
    },
    {
      id: "2",
      title: i18n.t("DESTINATION_COUNTRY"),
      onPress: { action: "SET_LOCATION" },
    },
    {
      id: "3",
      title: i18n.t("DARK_THEME"),
      value: "darkThemeIsEnabled",
      onValueChange: "switchTheme",
      switch: true,
    },
    {
      id: "4",
      title: i18n.t("ARCHIVE_DELIVERED_PARCELS"),
      value: "archiveParcelIsEnabled",
      onValueChange: "switchArchive",
      switch: true,
    },
    {
      id: "5",
      title: uid + ' ' + i18n.t("LOGOUT"),
      onPress: { action: "LOGOUT" },
    },
  ];

  const setDark = () => {
    dispatch(setDarkTheme());
  };

  const setDefault = () => {
    dispatch(setDefaultTheme());
  };

  const switchArchive = () => {
    setArchiveParcelIsEnabled(!archiveParcelIsEnabled);
  };

  const switchTheme = () => {
    if (darkThemeIsEnabled) {
      setDarkThemeIsEnabled(false);
      setDefault();
    } else {
      setDarkThemeIsEnabled(true);
      setDark();
    }
  };

  const onPressFunc = (action: string) => {
    if(action === "LOGOUT") {
      dispatch(logOut());
      dispatch(resetItems());
    } else {
      navigation.navigate("Location", {
        action: action,
      });
    }
  };

  const onValueChangeFunc = (action: string) => {
    switch (action) {
      case "switchTheme":
        switchTheme();
        break;
      case "switchArchive":
        switchArchive();
        break;
      default:
    }
  };

  const getStateValue = (value: string) => {
    switch (value) {
      case "darkThemeIsEnabled":
        return darkThemeIsEnabled;
      case "archiveParcelIsEnabled":
        return archiveParcelIsEnabled;
      default:
    }
  };

  const SwitchItem = ({ item, value, onValueChange_ }) => (
    <View style={[styles.item]}>
      <Text style={styles.text}>{item.title}</Text>
      <Switch
        style={styles.switch}
        trackColor={{ false: "#3e3e3e", true: AppTheme[theme].button }}
        thumbColor={isEnabled ? "#2C6BED" : "#f4f3f4"}
        ios_backgroundColor="#3e3e3e"
        onValueChange={() => onValueChangeFunc(onValueChange_)}
        value={getStateValue(value)}
      />
    </View>
  );

  const Item = ({ item, onPress, backgroundColor, textColor }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.item, backgroundColor]}
      //disabled={}
    >
      <Text style={[styles.title, textColor]}>{item.title}</Text>

      <MaterialCommunityIcons
        name="chevron-right"
        size={24}
        color={AppTheme[theme].button}
        style={styles.icon}
      />
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => {
    console.log("render item ITEM", item);
    const backgroundColor = "";
    const color = AppTheme[theme].text;
    if (item?.switch) {
      return (
        <SwitchItem
          item={item}
          value={item.value}
          onValueChange_={item.onValueChange}
        />
      );
    } else {
      return (
        <Item
          item={item}
          onPress={() => {
            onPressFunc(item.onPress.action);
          }}
          backgroundColor={{ backgroundColor }}
          textColor={{ color }}
        />
      );
    }
  };

  const itemSeparatorView = () => {
    return <View style={styles.separator} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <NotificationsComponent />
      <FlatList
        data={SETTINGS_DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={itemSeparatorView}
        //extraData={selectedId}
      />
      <View style={styles.version}>
        <Text style={styles.text}>Version: {version}</Text>
      </View>
    </SafeAreaView>
  );

  //return (
  //<ThemeProvider theme={theme}>
  //<Container>

  //</Container>
  //</ThemeProvider>
  //);
};

const createStyles = (theme: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: AppTheme[theme].container,
    },
    row: {
      flexDirection: "row",
      margin: 10,
      alignItems: "center",
      color: AppTheme[theme].text,
      justifyContent: "space-between",
    },
    text: {
      color: AppTheme[theme].text,
    },
    switch: {},
    paragraph: {},
    item: {
      margin: 5,
      padding: 10,
      minHeight: 65,
      backgroundColor: AppTheme[theme].container,
      flexDirection: "row",
      borderRadius: 5,
      justifyContent: "space-between",
      alignItems: "center",
    },
    title: {},
    icon: {},
    separator: {
      height: 0.5,
      width: "100%",
      backgroundColor: AppTheme[theme].itemSeparator,
    },
    version: {
      alignItems: "center",
    }
  });

export default SettingsScreen;
