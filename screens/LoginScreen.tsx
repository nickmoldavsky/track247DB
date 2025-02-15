import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
  TextInput,
} from "react-native";
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Input, Button } from "react-native-elements";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { RootState } from "../store/store";
import { logIn, userLogin } from "../store/userSlice";
import i18n from "../i18n/i18n";
import { AppTheme } from "../styled/theme";
import { useIsFocused, NavigationAction } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import {
  ScreenStackHeaderBackButtonImage,
  ScreenStackHeaderSearchBarView,
} from "react-native-screens";
import { color } from "@rneui/base";

const LoginScreen: React.FC = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { uid, error } = useAppSelector((state) => state.user);
  const { theme, language } = useAppSelector(
    (state: RootState) => state.settings
  );
  i18n.locale = language;
  const input = useRef<TextInput>();
  const styles: any = useMemo(() => createStyles(theme), [theme]); //TODO: change any type
  const [inputUsername, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const isFocused = useIsFocused();
  const pageTitle = i18n.t("LOGIN");

  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackVisible: false,
      title: pageTitle,
      headerStyle: { backgroundColor: AppTheme[theme].header },
    });
  }, [theme, language]);

  useEffect(() => {
    if (uid) {
      navigation.navigate("Home");
    }
  }, [uid]);

  const submitForm = () => {
    if (!inputUsername || !inputPassword) {
      input.current?.shake();
      return;
    }
    const userData = {
      email: inputUsername,
      password: inputPassword,
    };
    dispatch(userLogin(userData));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.formView, styles.inner]}>
          {error && <Text style={[styles.formTitle, styles.formError]}>{error}</Text>}
          <Input
            ref={input}
            placeholderTextColor={AppTheme[theme].text}
            inputStyle={[styles.formInput]}
            value={inputUsername}
            placeholder={i18n.t("USERNAME")}
            leftIcon={{
              type: "font-awesome",
              name: "barcode",
              color: AppTheme[theme].button,
            }}
            onChangeText={(value) => setInputUsername(value)}
          />
          <Input
            placeholderTextColor={AppTheme[theme].text}
            inputStyle={[styles.formInput]}
            value={inputPassword}
            placeholder={i18n.t("PASSWORD")}
            leftIcon={{
              type: "font-awesome",
              name: "file-text-o",
              color: AppTheme[theme].button,
            }}
            onChangeText={(value) => setInputPassword(value)}
          />
          {/* <View style={styles.forgotPasswordlink}>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.forgotPasswordlink}>Forgot password?</Text>
            </TouchableOpacity>
          </View> */}
          <View style={styles.buttonsWrapper}>
            <Button
              //disabled={!inputUserName}
              buttonStyle={{
                width: 200,
                backgroundColor: AppTheme[theme].button,
                borderRadius: 3,
              }}
              title={i18n.t("LOGIN")}
              onPress={() => submitForm()}
            />
          </View>
          <View style={styles.buttonsWrapper}>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.registerLink}>Don't have an account?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const createStyles = (theme: string) =>
  StyleSheet.create<Style>({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: AppTheme[theme].container,
    },
    formTitle: {
      marginBottom: 15,
      textAlign: "center",
      fontSize: 18,
      fontWeight: "500",
      color: AppTheme[theme].title,
    },
    formView: {
      width: "80%",
    },
    formInput: {
      color: AppTheme[theme].text,
    },
    formError: {
      color: 'red',
    },
    buttonsWrapper: {
      flexDirection: "row",
      justifyContent: "center",
    },
    button: {
      padding: 10,
      backgroundColor: AppTheme[theme].button,
      color: AppTheme[theme].button,
    },
    registerLink: {
      marginTop: 20,
      color: AppTheme[theme].text,
    },
    forgotPasswordlink: {
      color: AppTheme[theme].text,
    },
  });
