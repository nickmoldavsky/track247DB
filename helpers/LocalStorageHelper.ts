import AsyncStorage from "@react-native-async-storage/async-storage";

const localStorageHelper = {

  getData: async (key: string) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue !== null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error(e);
    }
  },

  setData: async (key: string, value: string) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
      console.error(e);
    }
  },

};

export default localStorageHelper;
