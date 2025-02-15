import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Location from "expo-location";
import * as Localization from "expo-localization";
import localStorageHelper from "../helpers/LocalStorageHelper";

const LocationComponent = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const locale = Localization.region;
  console.log("locale: ", locale);
  const deviceLanguage = Localization.locale.replace(/_/g, "-").toLowerCase();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        alert("Permission to access location was denied");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      console.log("Location.getCurrentPositionAsync: ", location);
      reverseGeoCode(location["coords"].latitude, location["coords"].longitude);
    })();
  }, []);

  const reverseGeoCode = async (latitude, longitude) => {
    const geoCodeAdress = await Location.reverseGeocodeAsync({
      longitude,
      latitude,
    });
    setLocation(geoCodeAdress);
    localStorageHelper.setData("USER_LOCATION", geoCodeAdress);
    console.log("geoCodeAdress: ", geoCodeAdress);
  };

  const geoCode = async () => {
    const geoCodeLocation = await Location.geocodeAsync(adress);
    console.log("geoCodeLocation: ", geoCodeLocation);
  };

  let text = "Getting Location...";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location[0].country);
  }

  return (
    <View style={styles.container}>
      <View style={styles.lang}>
        <Text style={styles.text}>
          Locale city: {JSON.stringify(location[0].city)}
        </Text>
        <Text style={styles.text}>Device Language: {deviceLanguage}</Text>
      </View>

      <View style={styles.geo}>
        <Text style={styles.paragraph}>{text}</Text>
        <Text style={styles.paragraph}>{errorMsg}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  paragraph: {},
});

export default LocationComponent;
