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
import { Feather } from "@expo/vector-icons";
import { ScrollView } from "react-native-gesture-handler";

// Email validation function
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Username validation function

const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9]+$/;
  return usernameRegex.test(username);
};

// Password strength validation function
const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecialChar
  );
};

const Register = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSecurePassword, setIsSecurePassword] = useState(true);
  const [isSecureConfirmPassword, setIsSecureConfirmPassword] = useState(true);
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setIsSecurePassword((prevState) => !prevState);
  };

  const toggleConfirmPasswordVisibility = () => {
    setIsSecureConfirmPassword((prevState) => !prevState);
  };

  const showToast = (message) => {
    Toast.show({
      type: "error",
      text1: "Validation Error",
      text2: message,
    });
  };

  const handleRegister = async () => {
    if (!fullName) {
      showToast("Full Name is required");
      return;
    }

    if (!username) {
      showToast("Username is required");
      return;
    }

    if (!email) {
      showToast("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      showToast("Invalid Email Format");
      return;
    }

    if (!password) {
      showToast("Password is required");
      return;
    }

    if (!validatePasswordStrength(password)) {
      showToast(
        "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character"
      );
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "https://lagosnawa.com/wp-json/custom/v1/register",
        {
          name: fullName,
          username,
          email,
          password,
        }
      );

      // Handle successful registration
      Toast.show({
        type: "success",
        text1: "Registration Successful",
        text2: "You can now access the app.",
      });

      // Navigate to the login screen after 5 seconds
      setTimeout(() => {
        navigation.navigate("Home");
      }, 3000);
    } catch (error) {
      showToast(
        "Registration Failed: " +
          (error.response?.data?.message || "Unknown error.")
      );
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={styles.container}>
          <Image style={styles.logo} source={require("../assets/chat.png")} />
          <View style={styles.textContainer}>
            <Text style={styles.title}>Sign Up</Text>
            <Text style={styles.subtitle}>
              Join us and stay informed with the latest news tailored to you
            </Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="rgba(168, 13, 13, 0.3)"
              style={styles.textInput}
              value={fullName}
              onChangeText={setFullName}
            />
            <TextInput
              placeholder="Username"
              placeholderTextColor="rgba(168, 13, 13, 0.3)"
              style={styles.textInput}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <TextInput
              placeholder="Email Address"
              placeholderTextColor="rgba(168, 13, 13, 0.3)"
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Password"
                placeholderTextColor="rgba(168, 13, 13, 0.3)"
                secureTextEntry={isSecurePassword}
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
                  name={isSecurePassword ? "eye-off" : "eye"}
                  size={20}
                  color={theme.colors.backgroundColor}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Confirm Password"
                placeholderTextColor="rgba(168, 13, 13, 0.3)"
                secureTextEntry={isSecureConfirmPassword}
                style={[styles.textInput, styles.passwordInput]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={toggleConfirmPasswordVisibility}
                style={styles.eyeIcon}
              >
                <Feather
                  name={isSecureConfirmPassword ? "eye-off" : "eye"}
                  size={20}
                  color={theme.colors.backgroundColor}
                />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.signUpButtonText}>
              {loading ? "Signing up..." : "Sign Up"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.switch}>
              Already have an Account?{" "}
              <Text style={{ fontWeight: 800 }}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  passwordContainer: {
    position: "relative",
    marginBottom: 10,
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
  switch: {
    fontFamily: Font["poppins-semibold"],
    fontSize: FontSize.medium,
    color: theme.colors.backgroundColor,
    marginVertical: 1,
    alignSelf: "center",
  },
  signUpButton: {
    backgroundColor: theme.colors.backgroundColor,
    padding: 15,
    borderRadius: Spacing,
    alignItems: "center",
    marginVertical: Spacing + 20,
  },
  signUpButtonText: {
    fontFamily: Font["poppins-bold"],
    fontSize: FontSize.medium,
    color: theme.colors.backgroundHighlightColor,
  },
});

export default Register;
