import React, { useState, useEffect, useLayoutEffect, useMemo } from "react";
import { Text, View, StyleSheet, Button, Pressable } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { AppTheme } from "../styled/theme";
import { ScannerScreenProps } from "../types/types";
import i18n from "../i18n/i18n";
import { useAppSelector } from "../hooks/redux";

const ScannerScreen: React.FC = ({ navigation }: ScannerScreenProps) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const { theme,language } = useAppSelector(
    (state) => state.settings
  );
  const styles = useMemo(() => createStyles(theme), [theme]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: i18n.t("SCANNER"),
      headerBackTitleVisible: false,
      headerStyle: {
        backgroundColor: AppTheme[theme].header,
      },
    });
  }, [theme, language]);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    //alert(`Bar code with type ${type} and data ${data} has been scanned!`);
    navigation.navigate("NewParcel", { action: "ADD_WITH_BAR_CODE", trackingNumber: data });
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        <Pressable style={styles.button} onPress={() => setScanned(false)}>
         <Text style={styles.text}>{i18n.t("TAP_TO_SCAN_AGAIN")}</Text>
        </Pressable>
      )}
    </View>
  );
};

const createStyles = (theme: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: "column",
      justifyContent: "center",
      backgroundColor: AppTheme[theme].container,
    },
    text: {
      color: "#FFF",
      fontSize: 16,
    },
    button: {
      width: "100%",
      height: 50,
      position: "absolute",
      bottom: 0,
      backgroundColor: AppTheme[theme].button,
      alignItems: 'center',
      justifyContent: 'center',
    }
  });

export default ScannerScreen;
