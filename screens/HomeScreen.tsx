import React, {
  useState,
  useEffect,
  useMemo,
  useLayoutEffect,
  ReactPropTypes,
  useRef,
} from "react";
import {
  SafeAreaView,
  Text,
  StyleSheet,
  View,
  FlatList,
  ListRenderItem,
  Pressable,
  TouchableOpacity,
  Modal,
  Alert,
  RefreshControl,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SearchBar, Avatar } from "react-native-elements";
import {
  AntDesign,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons/";
import { useIsFocused } from "@react-navigation/native";
//store
import {
  deleteDeliveredParcels,
  deleteParcel,
  deleteParcelFromDb,
  setUpdateStateFlag,
  setErrorStateFlag,
  editParcel,
  updateParcel,
  getTracksByUserId,
  updateParcelInDb,
} from "../store/parcelSlice";
//interfaces
import { IParcel } from "../interfaces/parcel";
//styled
import { AppTheme } from "../styled/theme";
import i18n from "../i18n/i18n";
import { NativeStackScreenProps } from "@react-navigation/native-stack/lib/typescript/src/types";
import { RootStackParamList, UpdateParcelParams } from "../types/types";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import ParcelListItem from "../components/ParcelListItemComponent";

type HomeProps = NativeStackScreenProps<RootStackParamList, "Home">;

const HomeScreen: React.FC = ({ navigation, route }: HomeProps) => {
  const [search, setSearch] = useState<string>("");
  const [filteredDataSource, setFilteredDataSource] = useState<IParcel[]>([]);
  const [masterDataSource, setMasterDataSource] = useState<IParcel[]>([]);
  const isFocused = useIsFocused();
  const [isEditModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [itemData, setItemData] = useState<IParcel>();
  const [activeTab, setActiveTab] = useState<string>("");
  //TODO delete it
  //const [modal, setModal] = useState({ action: "", value: "", visible: false });
  //store
  const dispatch = useAppDispatch();
  const { items, updateStateFlag } = useAppSelector((state) => state.parcel);
  const { theme, darkmode, language, location } = useAppSelector(
    (state) => state.settings
  );
  const { uid, updateItemsFlag } = useAppSelector((state) => state.user);
  i18n.locale = language;
  // Constructing styles for current theme
  const styles = useMemo(() => createStyles(theme), [theme]);
  const activeItemsCount = 0;
  const deliveredItemsCount = 0;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "",
      headerTitleAlign: "left",
      headerBackTitleVisible: false,
      headerStyle: { backgroundColor: AppTheme[theme].header },
      headerTitle: () => (
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
          {/* <Avatar rounded source={require("../assets/moto.jpeg")} /> */}
          <MaterialCommunityIcons name="gift" size={24} color="white" />
          <Text
            style={{
              color: "white",
              marginLeft: 10,
              fontWeight: "700",
            }}
          >
            Track24/7
          </Text>
        </View>
      ),
      headerRight: () => (
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.scannerIcon}
            onPress={() => navigation.navigate("Scanner")}
          >
            <FontAwesome name="barcode" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
            <FontAwesome name="gear" size={24} color="white" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [theme]);

  // useEffect(() => {
  //   if(isFocused && updateStateFlag) {
  //     alert('main');
  //     if (uid) {
  //       dispatch(getTracksByUserId(uid));
  //     }
  //   }
    
  // }, [isFocused]);

  // useEffect(() => {
  //   setData();
  //   clearParams();
  // }, [updateStateFlag]);

  useEffect(() => {
    tabFilterFunction("active");
  }, [masterDataSource]);

  useEffect(() => {
    //user accsess control
    if (!uid) {
      //dispatch update items
      dispatch(setUpdateStateFlag(true));
      navigation.navigate("Login");
    }

    if (isFocused) {
      dispatch(setErrorStateFlag(false));
      if (updateStateFlag) {
        setData();
        clearParams();
      }
    } else {
      
    }
    return () => {
      closeEditModal();
    };
  }, [isFocused, uid]);

  // test db
  useEffect(() => {
    console.log("HomeScreen/items:", items);
    setMasterDataSource(items);
  }, [items]);

  //test db
  const fetchData = async () => {
    if (uid) {
      return dispatch(getTracksByUserId(uid));
    }
  };
  //

  const setData = async () => {
    const data = await fetchData();
    //console.log("setData items", data.payload.tracks[0]);
    //setMasterDataSource(items);
    //setMasterDataSource(data.payload.tracks[0]);
  };

  const openEditModal = (item: IParcel) => {
    if (item.id) {
      setItemData(item);
      setEditModalVisible(true);
      console.log("setItemData item", item);
    }
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
  };

  const clearParams = () => {
    dispatch(setUpdateStateFlag(false));
  };

  //TODO: change it
  const tabFilterFunction = (tab: string) => {
    // const shipping_ = ["transit", "arrived"];
    // const shippingSet = new Set(shipping_),
    // events = [{ file: 'css/style.css', type: 'css' }, { file: 'js/app.js', type: 'js' }, { file: 'index/html.html', type: 'html' }],
    // list = masterDataSource.filter((item) => shippingSet.has(item.status));
    // console.log("list: ", list);
    //let data = masterDataSource.sort((a, b) => a.status.localeCompare(b.status));
    //console.log('data sort by:', data);

    const shipping = ["TRANSIT", "ARRIVED", "PICKUP", "ARCHIVE", ""];
    setActiveTab(tab);
    if (tab) {
      const newData = masterDataSource.filter(function (item: IParcel) {
        const itemData = item.status ? item.status.toUpperCase() : "";
        const textData = tab.toUpperCase();
        if (tab === "active") {
          return shipping.indexOf(itemData) > -1;
        } else {
          return itemData.indexOf(textData) > -1;
        }
      });
      console.log("newData:", newData);
      setFilteredDataSource(newData);
    } else {
      setFilteredDataSource(masterDataSource);
    }
  };

  const searchFilterFunction = (text: string) => {
    // Check if searched text is not blank
    if (text) {
      // Filter the masterDataSource and update FilteredDataSource
      const newData = masterDataSource.filter(function (item: IParcel) {
        // Applying filter for the inserted text in search bar
        const itemData = item.track_title
          ? item.track_title.toUpperCase()
          : "".toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setFilteredDataSource(newData);
      setSearch(text);
    } else {
      // Inserted text is blank
      // Update FilteredDataSource with masterDataSource
      setFilteredDataSource(masterDataSource);
      setSearch(text);
      tabFilterFunction(activeTab);
    }
  };

  const itemSeparatorView = () => {
    return (
      // Flat List Item Separator
      <View style={styles.separator} />
    );
  };

  const deleteItem = () => {
    if (itemData.id) {
      const filteredData = filteredDataSource.filter(function (item) {
        return item.id !== itemData.id;
      });
      setFilteredDataSource(filteredData);
      dispatch(deleteParcel(itemData.id));
      //delete item from db
      dispatch(deleteParcelFromDb(itemData.id));
      closeEditModal();
    } else {
      console.log("deleteItem error - no itemData id");
    }
  };

  const showConfirmDialog = (action: string) => {
    if (action === "DELETE_ALL") {
      return Alert.alert(
        "Delete all delivered parcels?",
        "Are you sure you want to remove all delivered items?",
        [
          {
            text: "Cancel",
          },
          {
            text: "Delete",
            onPress: () => {
              deleteDeliveredParcels();
            },
          },
        ]
      );
    } else {
      return Alert.alert(
        "Delete parcel?",
        "Are you sure you want to remove " + itemData.track_title + "?",
        [
          {
            text: "Cancel",
          },
          {
            text: "Delete",
            onPress: () => {
              deleteItem();
            },
          },
        ]
      );
    }
  };

  const updateParcel = (status: string) => {
    const params: UpdateParcelParams = {
      id: itemData.id,
      action: "UPDATE_STATUS",
      status,
    };
    console.log('home/updateParcel params', params);
    dispatch(editParcel(params));
    dispatch(updateParcelInDb(params));
    //TODO: update status in db
    closeEditModal();
  };

  // const closeNewItemModal = () => {
  //   //alert('HomeScreen/closeNewItemModal function');
  //   //setClick(false);
  //   setModal({ visible: false });
  // };

  // const toggleModal = (action = "", value = "") => {
  //   if (action === "update") {
  //     //setClick(true);
  //     setModal({ action: action, visible: true });
  //   } else {
  //     setModal({ action: action, visible: true });
  //   }
  // };

  const deleteDeliveredItems = () => {
    return;
    dispatch(deleteDeliveredParcels());
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.searchBar}>
          <SearchBar
            placeholder={i18n.t("search")}
            //onChangeText={searchFilterFunction}
            onChangeText={(value) => searchFilterFunction(value)}
            value={search}
            lightTheme={!darkmode}
            round={true}
            containerStyle={styles.searchBarContainer}
          />
        </View>

        <View style={[styles.tabView, styles.row]}>
          <TouchableOpacity
            style={[
              styles.button,
              {
                borderBottomColor:
                  activeTab === "active"
                    ? AppTheme[theme].button
                    : AppTheme[theme].itemSeparator,
              },
            ]}
            onPress={() => tabFilterFunction("active")}
          >
            <Text style={[styles.text, styles.buttonText]}>
              {i18n.t("ACTIVE")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              {
                borderBottomColor:
                  activeTab === "delivered"
                    ? AppTheme[theme].button
                    : AppTheme[theme].itemSeparator,
              },
            ]}
            onPress={() => tabFilterFunction("delivered")}
          >
            <Text style={[styles.text, styles.buttonText]}>
              {i18n.t("DELIVERED")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* delete all delivered items option */}
        {activeTab === "delivered" && (
          <View style={styles.row}>
            <Pressable
              style={[styles.deleteButton, styles.row]}
              onPress={() => showConfirmDialog("DELETE_ALL")}
            >
              <MaterialCommunityIcons
                style={styles.modalIcon}
                name="delete-outline"
                size={24}
                color="black"
              />
              <Text style={styles.text}>
                {i18n.t("DELETE_ALL_DELIVERED_ITEMS")}
              </Text>
            </Pressable>
          </View>
        )}

        <FlatList
          data={[...filteredDataSource].sort((a, b) => {
            return a.track_title?.localeCompare(b.status);
          })}
          //data={items}
          keyExtractor={(item, index) => index.toString()}
          ItemSeparatorComponent={itemSeparatorView}
          //ListRenderItem<IParcel[]>
          renderItem={({ item }) => (
            <ParcelListItem item={item} openEditModal={openEditModal} />
          )}
        />

        <View style={styles.addButtonContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("NewParcel", { action: "add" })}
            //onPress={() => navigation.navigate("Notifications", { action: "add" })}
          >
            <AntDesign
              name="pluscircle"
              size={54}
              color={AppTheme[theme].button}
            />
          </TouchableOpacity>
        </View>

        <StatusBar style="light" />
      </View>

      <Modal
        style={styles.modal}
        visible={isEditModalVisible}
        onRequestClose={closeEditModal}
        animationType="fade"
        transparent
      >
        <Pressable style={styles.upper} onPress={closeEditModal} />
        <View style={styles.lower}>
          <Text style={styles.modalTitle}>
            {itemData?.track_title} {itemData?.trackingNumber}
          </Text>
          <Pressable
            style={styles.row}
            onPress={() => updateParcel("delivered")}
            disabled={itemData?.status === "delivered"}
          >
            <MaterialCommunityIcons
              style={styles.modalIcon}
              name="archive-arrow-down-outline"
              size={24}
              color="black"
            />
            <Text style={styles.text}>{i18n.t("ARCHIVE")}</Text>
          </Pressable>
          <Pressable
            style={styles.row}
            onPress={() =>
              navigation.navigate("NewParcel", {
                action: "edit",
                id: itemData?.id,
                trackingNumber: itemData?.trackingNumber,
                title: itemData?.track_title,
              })
            }
          >
            <MaterialCommunityIcons
              style={styles.modalIcon}
              name="archive-edit-outline"
              size={24}
              color="black"
            />
            <Text style={styles.text}>{i18n.t("EDIT")}</Text>
          </Pressable>
          <Pressable
            style={styles.row}
            onPress={() => showConfirmDialog("DELETE")}
          >
            <MaterialCommunityIcons
              style={styles.modalIcon}
              name="delete-outline"
              size={24}
              color="black"
            />
            <Text style={styles.text}>{i18n.t("DELETE")}</Text>
          </Pressable>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (theme: string) =>
  StyleSheet.create({
    container: {
      backgroundColor: AppTheme[theme].container,
      flex: 1,
    },
    headerRight: {
      flexDirection: "row",
      marginRight: Platform.OS === "ios" ? 40 : 0,
    },
    scannerIcon: {
      marginRight: 20,
    },
    tabView: {
      justifyContent: "space-between",
      //alignItems: 'center',
    },
    searchBarContainer: {
      borderBottomColor: "transparent",
      borderTopColor: "transparent",
    },
    searchBar: {},
    button: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      borderBottomWidth: 1,
    },
    buttonText: {
      padding: 5,
    },
    text: {
      color: AppTheme[theme].text,
    },
    addButtonContainer: {
      alignSelf: "flex-end",
      position: "absolute",
      bottom: 25,
      right: 25,
    },
    addButton: {},
    row: {
      flexDirection: "row",
      margin: 10,
      alignItems: "center",
    },
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 22,
    },
    textStyle: {
      color: AppTheme[theme].text,
      fontWeight: "bold",
      textAlign: "center",
    },
    modal: {},
    modalIcon: {
      paddingRight: 10,
      paddingLeft: 10,
      color: AppTheme[theme].text,
    },
    modalTitle: {
      paddingLeft: 20,
      fontWeight: "bold",
      color: AppTheme[theme].title,
    },
    upper: {
      height: "75%",
      backgroundColor: "#000",
      opacity: 0.7,
    },
    lower: {
      flex: 1,
      backgroundColor: AppTheme[theme].container,
      height: "25%",
      justifyContent: "center",
      alignItems: "flex-start",
    },
    deleteDeliveredButton: {},
    deleteButton: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      margin: 1,
    },
    separator: {
      height: 0.5,
      width: "100%",
      backgroundColor: AppTheme[theme].itemSeparator,
    },
  });

export default HomeScreen;
