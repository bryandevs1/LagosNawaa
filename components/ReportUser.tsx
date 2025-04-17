import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity, // For custom button style
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as MailComposer from "expo-mail-composer";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message"; // Import Toast
import RNPickerSelect from "react-native-picker-select"; // Import the picker component
import { MaterialIcons } from "@expo/vector-icons"; // Import icons
import { useNavigation } from "@react-navigation/native"; // Import navigation hook

const UserScreen = () => {
  const navigation = useNavigation(); // Get navigation object
  const [username, setUsername] = useState(""); // New state for username
  const [reason, setReason] = useState(""); // Previously 'tag', renamed for clarity
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.get(
          "https://africanawa.com/wp-json/wp/v2/categories?per_page=100",
          { headers }
        );
        const categoryOptions = response.data.map((cat) => ({
          label: cat.name,
          value: cat.name,
        }));

        setCategories(categoryOptions);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        Toast.show({
          type: "error",
          text1: "Error fetching categories",
          text2: "Please try again later.",
        });
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async () => {
    if (!username.trim() || !reason.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Username and reason are required.",
      });
      return;
    }

    try {
      const response = await axios.post(
        "https://back.ikoyiproperty.com:8443/report-newsuser",
        {
          username,
          reason,
        }
      );

      Toast.show({
        type: "success",
        text1: "Report Submitted",
        text2: `${response.data.message}. Please allow 24 hours`,
      });

      setTimeout(() => {
        setUsername("");
        setReason("");
        handleClose();
      }, 5000);
    } catch (error) {
      console.error("Error submitting user report:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.error || "An error occurred.",
      });
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.modalContainer}>
      <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
        <MaterialIcons name="close" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Username Input */}
      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Enter the username to report"
      />

      {/* Reason Input */}
      <Text style={styles.label}>Reason</Text>
      <TextInput
        style={styles.input}
        value={reason}
        onChangeText={setReason}
        placeholder="Provide the reason for reporting"
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>

      <Toast />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  modalContainer: {
    position: "absolute",
    bottom: 0,
    height: "95%", // Make the modal cover 95% of the screen
    width: "100%",
    backgroundColor: "#fff", // Set background to white
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 70,
    padding: 20,
    elevation: 10, // Add shadow for Android
    shadowColor: "#000", // Add shadow for iOS
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4c270a", // Customize the color as needed
    justifyContent: "center",
    alignItems: "center",
    elevation: 3, // Add shadow for Android
    shadowColor: "#000", // Add shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    // Add blurred background
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    // Adjust blur radius as needed
    filter: "blur(2px)",
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "600",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff", // White background
    padding: 15,
    borderRadius: 10, // Rounded corners
    marginBottom: 20,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    height: 120,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#4c270a",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  container: {
    flex: 1,
    paddingTop: 100,
    padding: 20,
    backgroundColor: "#f7f7f7", // Light background
  },
  imagePickerButton: {
    backgroundColor: "#ececec", // Grey background for image picker
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  imagePickerText: {
    color: "#555", // Grey text
    fontSize: 16,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10, // Rounded corners for image
    marginBottom: 20,
  },
});

// Picker styles
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    color: "black",
    paddingRight: 30, // To ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    color: "black",
    paddingRight: 30, // To ensure the text is never behind the icon
  },
});

export default UserScreen;
