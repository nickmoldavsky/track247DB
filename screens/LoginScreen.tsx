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
  const { uid, error, isLoading } = useAppSelector((state) => state.user);
  const { theme, language } = useAppSelector(
    (state: RootState) => state.settings
  );
  i18n.locale = language;
  const input = useRef<TextInput>();
  const styles: any = useMemo(() => createStyles(theme), [theme]); //TODO: change type 'any'
  const [inputUsername, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [validPassword, setValidPassword] = useState(false);
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

  const validateEmail = (text: string) => {
    console.log(text);
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (reg.test(text) === false) {
      setInputUsername(text);
      setValidPassword(false);
      return false;
    }
    else {
      setInputUsername(text);
      setValidPassword(true);
    }
  }

  const submitForm = () => {
    if (!inputUsername || !inputPassword || !validPassword) {
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
            //errorStyle={{ color: 'red' }}
            //errorMessage='ENTER A VALID EMAIL'
            inputStyle={[styles.formInput]}
            value={inputUsername}
            placeholder={i18n.t("USERNAME")}
            leftIcon={{
              type: "font-awesome",
              name: "user",
              color: AppTheme[theme].button,
            }}
            onChangeText={(value) => validateEmail(value)}
          />
          <Input
            placeholderTextColor={AppTheme[theme].text}
            inputStyle={[styles.formInput]}
            value={inputPassword}
            placeholder={i18n.t("PASSWORD")}
            leftIcon={{
              type: "font-awesome",
              name: "lock",
              color: AppTheme[theme].button,
            }}
            onChangeText={(value) => setInputPassword(value)}
            secureTextEntry={true}
          />
          {/* <View style={styles.forgotPasswordlink}>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.forgotPasswordlink}>Forgot password?</Text>
            </TouchableOpacity>
          </View> */}
          <View style={styles.buttonsWrapper}>
            <Button
              disabled={isLoading}
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
              <Text style={styles.registerLink}>{i18n.t("DONT_HAVE_AN_ACCOUNT")}</Text>
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
