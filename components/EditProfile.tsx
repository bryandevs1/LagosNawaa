import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Toast from "react-native-toast-message"; // Import Toast component
import StyledButton from "./StyledButton";

const EditProfileScreen = () => {
  const [userData, setUserData] = useState({
    name: "",
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.get(
        "https://lagosnawa.com/wp-json/wp/v2/users/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUserData({
        name: response.data.name,
      });
    } catch (error) {
      Toast.show({
        // Use Toast for error message
        type: "error",
        text1: "Error",
        text2: "Failed to load user data.",
        position: "top",
        visibilityTime: 4000,
      });
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const updateData = {
        name: userData.name,
      };

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.post(
        "https://lagosnawa.com/wp-json/wp/v2/users/me",
        updateData,
        config
      );

      Toast.show({
        // Use Toast for success message
        type: "success",
        text1: "Success",
        text2: "Profile updated!",
        position: "top",
        visibilityTime: 4000,
      });
    } catch (error) {
      Toast.show({
        // Use Toast for error message
        type: "error",
        text1: "Error",
        text2: "Failed to update profile.",
        position: "top",
        visibilityTime: 4000,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Edit Your Name</Text>
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={userData.name}
        onChangeText={(text) => setUserData({ ...userData, name: text })}
        placeholder="Enter your name"
      />
      <StyledButton title="Update Profile" onPress={handleUpdateProfile} />
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff", // Light background
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#a80d0d",
    padding: 10,
    marginBottom: 20,
    borderRadius: 5, // Rounded corners
  },
});

export default EditProfileScreen;
