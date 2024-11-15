import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { ScrollView } from "react-native-gesture-handler";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(false);
  const [isDisplayPrefExpanded, setIsDisplayPrefExpanded] = useState(false);

  // Animated value for the slide-out effect
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const name = await AsyncStorage.getItem("userName");
        if (name) {
          setUserName(name);
        }
      } catch (error) {
        console.log("Error fetching user name: ", error);
      }
    };

    fetchUserName();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        const response = await axios.get(
          "https://lagosnawa.com/wp-json/wp/v2/users/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserData(response.data);
      } else {
        console.log("No token found");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const toggleNotification = async () => {
    setIsNotificationEnabled((prevState) => !prevState);
    try {
      await AsyncStorage.setItem(
        "notificationsEnabled",
        JSON.stringify(!isNotificationEnabled)
      );
    } catch (error) {
      console.log("Error saving notification preference:", error);
    }
  };

  const toggleDarkMode = () => {
    Toast.show({
      type: "info",
      text1: "Coming Soon",
      text2: "Dark mode feature is under development.",
    });
  };

  const toggleDisplayPreference = () => {
    // Toggle the expansion state
    setIsDisplayPrefExpanded((prevState) => !prevState);

    // Animate the slide effect
    Animated.timing(slideAnim, {
      toValue: isDisplayPrefExpanded ? 0 : 1, // Slide in when expanded, slide out when collapsed
      duration: 300,
      useNativeDriver: false,
    }).start();
  };
  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(["userToken", "userName"]); // Removes both keys together

      const token = await AsyncStorage.getItem("userToken");
      const name = await AsyncStorage.getItem("userName");

      console.log("Token after logout:", token); // Should be null
      console.log("Username after logout:", name); // Should be null

      Toast.show({
        type: "success",
        text1: "Logged Out",
        text2: "You have successfully logged out.",
      });
      // Wait for 3 seconds before navigating to the login screen
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }], // Ensure "Login" is the correct screen name
        });
      }, 3000); // 3000 milliseconds = 3 seconds
      // Navigate back to the login screen
    } catch (error) {
      console.error("Error during logout:", error);
      Toast.show({
        type: "error",
        text1: "Logout Failed",
        text2: "Something went wrong. Please try again.",
      });
    }
  };

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const displayPrefHeight = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 70], // Adjust height for smooth sliding
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <MaterialIcons name="logout" size={30} color="#fff" />
      </TouchableOpacity>
      {/* User Info Section */}
      {userData && (
        <View style={styles.userInfoSection}>
          <Image
            source={{
              uri:
                userData.avatar_urls?.[96] || "https://via.placeholder.com/100",
            }}
            style={styles.profileImage}
          />
          <Text style={styles.userName}>{userData.name || "User"}</Text>
          <Text style={styles.userRole}>@ {userName}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("EditProfile")}
            style={styles.editButton}
          >
            <MaterialIcons name="edit" size={20} color="#4a90e2" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView>
        {/* Add Topic Section */}
        <View style={styles.addTopicSection}>
          <Text style={styles.addTopicText}>
            Hey, Want to add a post? Fill this form out to reach out to
            LagosNawa.
          </Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("AddPost", { screenType: "modal" })
            } // Navigate to AddPost with modal effect
            style={styles.addTopicButton}
          >
            <Text style={styles.addTopicButtonText}>+ Add Post</Text>
          </TouchableOpacity>
        </View>

        {/* Account Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Account settings</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("EditProfile")}
            style={styles.itemBtn}
          >
            <Text style={styles.itemBtnText}>Edit profile</Text>
            <MaterialIcons name="arrow-forward-ios" size={20} color="black" />
          </TouchableOpacity>
        </View>

        {/* App Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>App settings</Text>

          {/* Display preference */}
          <TouchableOpacity
            style={styles.itemBtn}
            onPress={toggleDisplayPreference}
          >
            <Text style={styles.itemBtnText}>Display preference</Text>
            <MaterialIcons
              name={isDisplayPrefExpanded ? "expand-less" : "expand-more"}
              size={20}
              color="black"
            />
          </TouchableOpacity>

          {/* Sliding dark mode toggle */}
          <Animated.View
            style={[styles.slideContainer, { height: displayPrefHeight }]}
          >
            <TouchableOpacity style={styles.itemBtn} onPress={toggleDarkMode}>
              <Text style={styles.itemBtnText}>Dark Mode</Text>
              <MaterialIcons name="dark-mode" size={20} color="black" />
            </TouchableOpacity>
          </Animated.View>

          {/* Notifications */}
          <View style={styles.itemBtn}>
            <Text style={styles.itemBtnText}>Notification</Text>
            <Switch
              value={isNotificationEnabled}
              onValueChange={toggleNotification}
            />
          </View>
        </View>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  logoutButton: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.6)", // Semi-transparent for the chrome feel
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    backdropFilter: "blur(10px)", // Chromium style blur effect
    transition: "background-color 0.3s ease", // Smooth transition effect
  },

  userInfoSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
  },
  userRole: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  editButtonText: {
    fontSize: 16,
    color: "#4a90e2",
    marginLeft: 5,
  },
  addTopicSection: {
    backgroundColor: "#ffe5d1",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  addTopicText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  addTopicButton: {
    backgroundColor: "#a90d0d",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  addTopicButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  itemBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
  },
  itemBtnText: {
    fontSize: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  slideContainer: {
    overflow: "hidden",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginBottom: 10,
  },
});
