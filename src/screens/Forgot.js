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
import axios from "axios";
import Toast from "react-native-toast-message";
import Font from "../constants/Font";
import FontSize from "../constants/FontSize";
import { theme } from "../constants/theme";
import Spacing from "../constants/Spacing";

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const showToast = (type, message) => {
    Toast.show({
      type: type,
      text1: type.charAt(0).toUpperCase() + type.slice(1) + " Message",
      text2: message,
      position: "top",
      visibilityTime: 4000,
    });
  };

  const handlePasswordReset = async () => {
    if (!email) {
      showToast("error", "Email is required");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "https://lagosnawa.com/wp-json/custom/v1/lostpassword",
        { user_login: email }
      );

      // Check if response.data is a string and contains the success message
      if (
        typeof response.data === "string" &&
        response.data.includes("Password reset email sent")
      ) {
        showToast(
          "success",
          "Password reset link sent. Please check your email."
        );
        navigation.navigate("Login");
      } else {
        showToast("error", "Unable to send reset link. Please try again.");
      }
    } catch (error) {
      showToast("error", "Network error, please try again.");
      console.log(
        "Error:",
        error.response ? error.response.data : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Image style={styles.logo} source={require("../assets/chat.png")} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Enter your email to receive a password reset link.
          </Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Email Address"
            placeholderTextColor="rgba(168, 13, 13, 0.3)"
            style={styles.textInput}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handlePasswordReset}
          disabled={loading}
        >
          <Text style={styles.resetButtonText}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.switch}>Back to Login</Text>
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
    maxWidth: "80%",
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
  resetButton: {
    backgroundColor: theme.colors.backgroundColor,
    padding: 15,
    borderRadius: Spacing,
    alignItems: "center",
    marginVertical: Spacing + 20,
  },
  resetButtonText: {
    fontFamily: Font["poppins-bold"],
    fontSize: FontSize.medium,
    color: theme.colors.backgroundHighlightColor,
  },
  switch: {
    fontFamily: Font["poppins-semibold"],
    fontSize: FontSize.medium,
    color: theme.colors.backgroundColor,
    marginVertical: 10,
    alignSelf: "center",
  },
});

export default ForgotPassword;
