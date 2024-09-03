import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Toast from "react-native-toast-message";
import Font from "../constants/Font";
import FontSize from "../constants/FontSize";
import { theme } from "../constants/theme";
import Spacing from "../constants/Spacing";
import { Feather } from "@expo/vector-icons";

const Login = ({ navigation }) => {
  const [isSecure, setIsSecure] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setIsSecure((prevState) => !prevState);
  };

  const showToast = (type, message) => {
    Toast.show({
      type: type,
      text1: type.charAt(0).toUpperCase() + type.slice(1) + " Message",
      text2: message,
      position: "top",
      visibilityTime: 4000,
    });
  };

  const handleLogin = async () => {
    if (!username) {
      showToast("error", "Username is required");
      return;
    }

    if (!password) {
      showToast("error", "Password is required");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "https://lagosnawa.com/wp-json/jwt-auth/v1/token",
        {
          username,
          password,
        }
      );

      const { token } = response.data;

      // Save the token in AsyncStorage
      await AsyncStorage.setItem("userToken", token);

      // Navigate to the next screen
      // Show success toast and navigate to the next screen after 5 seconds
      Toast.show({
        type: "success",
        text1: "Login Successful",
        text2: "Welcome back!",
      });

      setTimeout(() => {
        navigation.navigate("Home"); // Replace "Home" with your actual home screen route
      }, 3000);
    } catch (error) {
      showToast("error", "Login Failed: Invalid username or password.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Image style={styles.logo} source={require("../assets/chat.png")} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>
            Welcome Back, You have been missed
          </Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Username or Email Address"
            placeholderTextColor="rgba(168, 13, 13, 0.3)"
            style={styles.textInput}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="rgba(168, 13, 13, 0.3)"
              secureTextEntry={isSecure}
              style={[styles.textInput, styles.passwordInput]}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={styles.eyeIcon}
            >
              <Feather
                name={isSecure ? "eye-off" : "eye"}
                size={20}
                color={theme.colors.backgroundColor}
              />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.forgotPassword}>Forgotten your password?</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.switch}>
            Don't have an Account?{" "}
            <Text style={{ fontWeight: 800 }}>Sign up Now</Text>
          </Text>
        </TouchableOpacity>
      </View>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 50,
  },
  logo: {
    width: 100,
    alignSelf: "center",
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: FontSize.xLarge,
    fontWeight: "800",
    color: theme.colors.backgroundColor,
    fontFamily: Font["poppins-bold"],
    marginVertical: 20,
  },
  subtitle: {
    fontFamily: Font["poppins-semibold"],
    fontSize: FontSize.large,
    maxWidth: "60%",
    textAlign: "center",
  },
  inputContainer: {
    marginVertical: Spacing,
  },
  textInput: {
    fontFamily: Font["poppins-regular"],
    fontSize: 16,
    padding: 15,
    marginVertical: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#dcdcdc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 50, // Space for the eye icon
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    top: "50%",
    transform: [{ translateY: -12 }],
  },
  forgotPassword: {
    fontFamily: Font["poppins-semibold"],
    fontSize: FontSize.medium,
    color: theme.colors.backgroundColor,
    marginVertical: 1,
    alignSelf: "flex-end",
  },
  switch: {
    fontFamily: Font["poppins-semibold"],
    fontSize: FontSize.medium,
    color: theme.colors.backgroundColor,
    marginVertical: 1,
    alignSelf: "center",
  },
  loginButton: {
    backgroundColor: theme.colors.backgroundColor,
    padding: 15,
    borderRadius: Spacing,
    alignItems: "center",
    marginVertical: Spacing + 20,
  },
  loginButtonText: {
    fontFamily: Font["poppins-bold"],
    fontSize: FontSize.medium,
    color: theme.colors.backgroundHighlightColor,
  },
});

export default Login;
