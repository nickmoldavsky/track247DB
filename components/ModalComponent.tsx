import React, { Component, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Alert,
  Pressable,
  Platform,
} from "react-native";
import { AntDesign } from "@expo/vector-icons/";

const ModalComponent = (props) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const item = "";
  console.log('Platform: ', Platform);
  console.log('props: ', props);

  useEffect(() => {
    //alert('ModalComponent useEffect click ' + props.click);
    if (props.modal.visible) {
      openModal();
    } else {
      closeModal();
    }
    return () => {
      //closeModal();
    };
  }, [props.modal.visible]);

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    props.onClick();
  };

  const showConfirmDialog = () => {
    return Alert.alert(
      "Delete parcel?",
      "Are you sure you want to remove parcel?",
      [
        {
          text: "Delete",
          onPress: () => {
            deleteItem();
          },
        },
        {
          text: "Cancel",
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Modal
        visible={isModalVisible}
        onRequestClose={closeModal}
        animationType="fade"
        transparent
      >
        <Pressable style={styles.upper} onPress={closeModal} />
        <AntDesign
          style={styles.closeButton}
          onPress={closeModal}
          name="close"
          size={24}
          color="black"
        />
        <View style={styles.lower}>{props.children}</View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  row: {
    flexDirection: "row",
    margin: 10,
    alignItems: "center",
  },
  upper: {
    backgroundColor: "#000",
    opacity: 0.7,
    ...Platform.select({
      ios: {
        height: "15%",
      },
      android: {
        height: "50%",
      },
    }),
  },
  lower: {
    flex: 1,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        height: "85%",
      },
      android: {
        height: "50%",
      },
      web: {
        height: "50%"
      }
    }),
  },
  closeButton: {},
});

export default ModalComponent;
