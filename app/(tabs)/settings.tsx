import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Switch,
  Image,
  Animated,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { Linking } from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import FeatherIcon from "@expo/vector-icons/Feather";

export default function ProfileScreen() {
  const openWebsite = (url: string) => {
    Linking.openURL(url).catch((err) => {
      console.error("Failed to open URL:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Unable to open the website.",
      });
    });
  };

  const navigation = useNavigation();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const [form, setForm] = useState({
    emailNotifications: true,
    pushNotifications: false,
  });
  const [selectedState, setSelectedState] = useState<string>("Lagos");
  const [isContactOptionsVisible, setContactOptionsVisible] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Updated animation ref
  const contactOptionsHeight = useRef(new Animated.Value(0)).current;

  const toggleContactOptions = () => {
    if (isContactOptionsVisible) {
      Animated.timing(contactOptionsHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false, // Layout animation, keep this false
      }).start(() => setContactOptionsVisible(false));
    } else {
      setContactOptionsVisible(true);
      Animated.timing(contactOptionsHeight, {
        toValue: 120, // Adjust height as needed
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };
  const sendEmail = (email: string, subject: string, body: string) => {
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    Linking.openURL(mailtoUrl).catch((err) => {
      console.error("Failed to open email client:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Unable to open the email client.",
      });
    });
  };

  const reportBug = async (email: string, subject: string, body: string) => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Toast.show({
          type: "error",
          text1: "Authentication Required",
          text2: "You need to be logged in to report a bug.",
        });
        return;
      }

      const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;

      Linking.openURL(mailtoUrl).catch((err) => {
        console.error("Failed to open email client:", err);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Unable to open the email client.",
        });
      });
    } catch (error) {
      console.error("Error checking user token:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Something went wrong. Please try again.",
      });
    }
  };
  const reportUser = async (email: string, subject: string, body: string) => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Toast.show({
          type: "error",
          text1: "Authentication Required",
          text2: "You need to be logged in to report a user.",
        });
        return;
      }
      navigation.navigate("Report user");
    } catch (error) {
      console.error("Error checking user token:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Something went wrong. Please try again.",
      });
    }
  };

  const navigateToContactOption = (screenName: string) => {
    navigation.navigate(screenName, { presentation: "modal" });
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove([
        "userToken",
        "userName",
        "bookmarks", // Add this to clear bookmarks
      ]);
      Toast.show({
        type: "success",
        text1: "Logged Out",
        text2: "You have successfully logged out.",
      });
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      }, 3000);
    } catch (error) {
      console.error("Error during logout:", error);
      Toast.show({
        type: "error",
        text1: "Logout Failed",
        text2: "Something went wrong. Please try again.",
      });
    }
  };

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const name = await AsyncStorage.getItem("userName");
        if (name) setUserName(name);
      } catch (error) {
        console.log("Error fetching user name: ", error);
      }
    };
    fetchUserName();
  }, []);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const name = await AsyncStorage.getItem("userToken");
        if (name) setToken(name);
      } catch (error) {
        console.log("Error fetching user name: ", error);
      }
    };
    fetchToken();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {}; // Use header only if token exists
      if (token) {
        const response = await axios.get(
          "https://africanawa.com/wp-json/wp/v2/users/me",
          { headers }
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.section, { paddingTop: 4 }]}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionBody}>
            <TouchableOpacity style={styles.profile}>
              <Image
                source={{
                  uri:
                    profilePicture ||
                    "https://africanawa.com/wp-content/themes/gorgo/assets/images/avatars/user-avatar.png",
                }}
                style={styles.profileAvatar}
              />
              <View style={styles.profileBody}>
                <Text style={styles.profileName}>
                  {userData?.name || "Guest User"}
                </Text>
                <Text style={styles.profileHandle}>@{userName}</Text>
              </View>
              {!token ? (
                ""
              ) : (
                <FeatherIcon
                  onPress={() => navigation.navigate("Edit Profile")}
                  color="#bcbcbc"
                  name="edit"
                  size={22}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.sectionBody}>
            <View style={styles.rowWrapper}></View>
            <View style={styles.rowWrapper}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Email Notifications</Text>
                <Switch
                  value={form.emailNotifications}
                  onValueChange={(emailNotifications) =>
                    setForm({ ...form, emailNotifications })
                  }
                />
              </View>
            </View>
            <View style={styles.rowWrapper}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Push Notifications</Text>
                <Switch
                  value={form.pushNotifications}
                  onValueChange={(pushNotifications) =>
                    setForm({ ...form, pushNotifications })
                  }
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
          <View style={styles.sectionBody}>
            <View style={styles.rowWrapper}>
              {!token ? (
                ""
              ) : (
                <TouchableOpacity
                  onPress={() => navigation.navigate("AddPost")}
                  style={styles.row}
                >
                  <Text style={styles.rowLabel}>Add A Post</Text>
                  <FeatherIcon color="#bcbcbc" name="chevron-right" size={19} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.row}
                onPress={toggleContactOptions}
              >
                <Text style={styles.rowLabel}>Contact Us</Text>
                <FeatherIcon
                  color="#bcbcbc"
                  name={isContactOptionsVisible ? "chevron-up" : "chevron-down"}
                  size={19}
                />
              </TouchableOpacity>

              <Animated.View
                style={[
                  styles.contactOptions,
                  { height: contactOptionsHeight },
                ]}
              >
                <TouchableOpacity
                  style={styles.contactOption}
                  onPress={() =>
                    sendEmail(
                      "admin@africanawa.com",
                      "Customer Support Inquiry",
                      "Hello, I need help with..."
                    )
                  }
                >
                  <Text style={styles.contactOptionText}>Via Email</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.contactOption}
                  onPress={() => navigateToContactOption("EmailScreen")}
                >
                  <Text style={styles.contactOptionText}>Fill Form</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.contactOption}
                  onPress={() => openWebsite("https://africanawa.com")}
                >
                  <Text style={styles.contactOptionText}>Visit Website</Text>
                </TouchableOpacity>
              </Animated.View>
              <TouchableOpacity onPress={reportUser} style={styles.row}>
                <Text style={styles.rowLabel}>Report User</Text>
                <FeatherIcon color="#bcbcbc" name="chevron-right" size={19} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  reportBug(
                    "admin@africanawa.com",
                    "Bug Report",
                    "Hello, I would love to report this bug..."
                  )
                }
                style={styles.row}
              >
                <Text style={styles.rowLabel}>Report Bug</Text>
                <FeatherIcon color="#bcbcbc" name="chevron-right" size={19} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  openWebsite("https://africanawa.com/privacy-policy/")
                }
                style={styles.row}
              >
                <Text style={styles.rowLabel}>Terms and Privacy</Text>
                <FeatherIcon color="#bcbcbc" name="chevron-right" size={19} />
              </TouchableOpacity>
              {!token ? (
                ""
              ) : (
                <TouchableOpacity
                  onPress={() => navigation.navigate("Delete")}
                  style={styles.row}
                >
                  <Text style={styles.rowLabel}>Delete my account</Text>
                  <FeatherIcon color="#bcbcbc" name="chevron-right" size={19} />
                </TouchableOpacity>
              )}
              {token ? (
                ""
              ) : (
                <TouchableOpacity
                  onPress={() =>
                    navigation.reset({
                      index: 0,
                      routes: [{ name: "Login" }],
                    })
                  }
                  style={styles.row}
                >
                  <Text style={styles.rowLabel}>Login</Text>
                  <FeatherIcon color="#bcbcbc" name="chevron-right" size={19} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          {!token ? (
            ""
          ) : (
            <TouchableOpacity onPress={handleLogout} style={styles.row}>
              <Text style={[styles.rowLabelLogout]}>Log Out</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.contentFooter}>App Version v1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /** Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 16,
    marginVertical: 20,
  },
  headerAction: {
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: "600",
    color: "#000",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    textAlign: "center",
  },
  /** Content */
  content: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === "android" ? 104 : 60,
  },
  contentFooter: {
    marginTop: -24,
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    color: "#a69f9f",
  },
  /** Section */
  section: {
    paddingVertical: 12,
  },
  sectionTitle: {
    margin: 8,
    marginLeft: 12,
    fontSize: 13,
    letterSpacing: 0.33,
    fontWeight: "500",
    color: "#a69f9f",
    textTransform: "uppercase",
  },
  contactOptions: {
    backgroundColor: "#fff",
    overflow: "hidden",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  contactOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  contactOptionText: {
    fontSize: 16,
    color: "#007aff",
  },
  sectionBody: {
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  /** Profile */
  profile: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 9999,
    marginRight: 12,
  },
  profileBody: {
    marginRight: "auto",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#292929",
  },
  profileHandle: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: "400",
    color: "#858585",
  },
  /** Row */
  row: {
    height: 44,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 12,
  },
  rowWrapper: {
    paddingLeft: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#f0f0f0",
  },
  rowFirst: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  rowLabel: {
    fontSize: 16,
    letterSpacing: 0.24,
    color: "#000",
  },
  rowSpacer: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  rowValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ababab",
    marginRight: 4,
  },
  rowLast: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  rowLabelLogout: {
    width: "100%",
    textAlign: "center",
    fontWeight: "600",
    color: "#4c270a",
    marginTop: -32,
  },
});
