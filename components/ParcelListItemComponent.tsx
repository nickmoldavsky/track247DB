import React, { Component, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { IParcel } from "../interfaces/parcel";
import { AppTheme } from "../styled/theme";
import i18n from "../i18n/i18n";
import { Entypo, MaterialCommunityIcons } from "@expo/vector-icons/";
import { useAppSelector } from "../hooks/redux";
import { useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack/lib/typescript/src/types";
import { RootStackParamList } from "../types/types";
import DateTimeHelper from "../helpers/DateTimeHelper";

type Props = {
  item: IParcel;
  openEditModal: any; //TODO change type
};

type NavigationProps = NativeStackScreenProps<RootStackParamList, "Details">;

const ParcelListItem: React.FC = ({ item, openEditModal }: Props) => {
  console.log("ParcelListItemComponent/props/item", item);
  const { navigate } = useNavigation<NavigationProps>();
  const { theme } = useAppSelector((state) => state.settings);
  const styles = useMemo(() => createStyles(theme), [theme]);

  const getItemDetails = (item : IParcel) => {
    const last_status = (item?.last_status.length) ? JSON.parse(item?.last_status).status : '';
    console.log('getItemDetails item:', last_status);
    navigate("Details", {
      trackingNumber: item.track_id,
      trackingTitle: item.track_title,
      trackingStatus: item.status,
      trackingLastStatus: last_status
    });
  };

  return (
    <TouchableOpacity onPress={() => getItemDetails(item)}>
      <View style={styles.listItem}>
        <View style={[styles.icon, styles.center]}>
          {item?.status &&
            item?.status !== "delivered" &&
            item?.status !== "pickup" &&
            item.status !== "arrived" && (
              <MaterialCommunityIcons
                name="truck-delivery-outline"
                size={40}
                color={AppTheme[theme].button}
                style={{ opacity: 0.9 }}
              />
            )}
          {item?.status === "arrived" && (
            <MaterialCommunityIcons
              name="truck-check-outline"
              size={40}
              color={AppTheme[theme].button}
            />
          )}
          {item?.status === "delivered" && (
            <MaterialCommunityIcons
              name="check-circle"
              size={40}
              color={AppTheme[theme].button}
            />
          )}
          {item?.status === "pickup" && (
            <MaterialCommunityIcons
              name="hand-extended"
              size={40}
              color={AppTheme[theme].button}
            />
          )}
          {!item.status && (
            <MaterialCommunityIcons name="truck-remove" size={40} color="red" />
          )}
        </View>
        <View style={styles.info}>
          <Text style={[styles.text, styles.title]}>{item?.track_title}</Text>
          <Text style={[styles.text, styles.opacity]}>{item?.track_id}</Text>
          {/* <Text style={styles.text}>{i18n.t(item?.status)}</Text> */}
          <Text style={styles.text} numberOfLines={1}>
            {!item.status ? i18n.t("NO_DATA") : ''}
            {(item?.last_status.length) ? JSON.parse(item.last_status).status : item?.status}
          </Text>
          <Text style={[styles.text, styles.dateTime, styles.opacity]} numberOfLines={1}>
            {DateTimeHelper.getFormattedDatetime(item?.lastState?.date)}
          </Text>
        </View>
        <TouchableOpacity
          
          onPress={() => openEditModal(item)}
        >
          <Entypo
            name="dots-three-vertical"
            size={24}
            color={AppTheme[theme].button}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: string) =>
  StyleSheet.create({
    listItem: {
      margin: 10,
      padding: 10,
      backgroundColor: AppTheme[theme].container,
      flex: 1,
      alignSelf: "center",
      flexDirection: "row",
      borderRadius: 5,
    },
    icon: {},
    center: {
      justifyContent: "center",
      alignItems: "center",
    },
    text: {
      color: AppTheme[theme].text,
    },
    title: {
      fontWeight: "bold",
    },
    info: {
      flex: 1,
      paddingLeft: 10,
    },
    opacity: {
      opacity: 0.7,
      marginTop: 3
    },
    dateTime: {
      
    },
  });

export default ParcelListItem;
