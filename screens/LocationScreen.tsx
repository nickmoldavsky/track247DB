import React, { useEffect, useState, useMemo, useLayoutEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { setLanguage, setLocation } from "../store/settingsSlice";
import { AppTheme } from "../styled/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons/";
import i18n from "../i18n/i18n";
import { RootState } from "../store/store";
import { Item, LocationScreenProps } from "../types/types";

const LocationScreen: React.FC = ({
  navigation,
  route,
}: LocationScreenProps) => {
  const ACTION = route.params.action;
  const dispatch = useDispatch();
  const { theme, darkmode, language, location } = useSelector(
    (state: RootState) => state.settings
  );
  const [selectedItem, setSelectedItem] = useState(
    ACTION !== "SET_LOCATION" ? language : location
  );
  const styles = useMemo(() => createStyles(theme), [theme]);
  const LANGUAGE_DATA = [
    { id: 1, title: "English", value: "en" },
    { id: 2, title: "Russian", value: "ru" },
    { id: 3, title: "Hebrew", value: "he" },
  ];
  const LOCATION_DATA = [
    { id: 1, title: "Israel", value: "israel" },
    { id: 2, title: "Russia", value: "russia" },
    { id: 3, title: "USA", value: "usa" },
  ];

  useLayoutEffect(() => {
    navigation.setOptions({
      title: i18n.t(ACTION),
      headerBackTitleVisible: false,
      headerStyle: {
        backgroundColor: AppTheme[theme].header,
      },
    });
  }, [theme, language]);

  const Item = ({ item, onPress, backgroundColor, textColor }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.item]}
      disabled={item.value === selectedItem}
    >
      <Text style={[styles.title, textColor]}>{item.title}</Text>
      {item.value === selectedItem && (
        <MaterialCommunityIcons
          name="check-circle"
          size={20}
          color={AppTheme[theme].button}
          style={styles.icon}
        />
      )}
    </TouchableOpacity>
  );

  const setItem = (item: Item) => {
    setSelectedItem(item.value);
    if (ACTION !== "SET_LOCATION") {
      dispatch(setLanguage(item.value));
    } else {
      dispatch(setLocation(item.value));
    }
  };

  const renderItem = ({ item }) => {
    const backgroundColor =
      item.value === selectedItem
        ? AppTheme[theme].button
        : AppTheme[theme].container;
    const color = AppTheme[theme].text;
    return (
      <Item
        item={item}
        onPress={() => {
          setItem(item);
        }}
        backgroundColor={{ backgroundColor }}
        textColor={{ color }}
      />
    );
  };

  const itemSeparatorView = () => {
    return (
      // Flat List Item Separator
      <View style={styles.separator} />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={ACTION !== "SET_LANGUAGE" ? LOCATION_DATA : LANGUAGE_DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={itemSeparatorView}
        //extraData={selectedId}
      />
    </SafeAreaView>
  );
};

const createStyles = (theme: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 0,
      backgroundColor: AppTheme[theme].container,
    },
    item: {
      margin: 10,
      padding: 10,
      backgroundColor: AppTheme[theme].container,
      flexDirection: "row",
      borderRadius: 5,
      justifyContent: "space-between",
    },
    icon: {},
    title: {
      fontSize: 16,
    },
    row: {
      flexDirection: "row",
      margin: 10,
      alignItems: "center",
    },
    separator: {
      height: 0.5,
      width: "100%",
      backgroundColor: AppTheme[theme].itemSeparator,
    },
  });

export default LocationScreen;
