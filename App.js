import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import SplashScreen from "./src/screens/SplashScreen";
import { Onboarding } from "./src/screens/Onboarding";
import Login from "./src/screens/Login";
import Register from "./src/screens/Register";
import TabsNavigator from "./app/_layout.tsx";
import Toast from "react-native-toast-message";
import NewsDetailScreen from "./app/news/[id]";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import Search from "./components/Search";
import AddPostScreen from "./components/AddPost";
import EditProfileScreen from "./components/EditProfile";
import ForgotPassword from "./src/screens/Forgot";
import EmailScreen from "./components/EmailScreen";
import DiscoverSearch from "./components/DiscoverSearch";
import TermsOfService from "./components/Terms";
import DeleteScreen from "./components/Delete";
import UserScreen from "./components/ReportUser";
import OneSignal from "react-native-onesignal";
import * as Notifications from "expo-notifications";

const Stack = createStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [showPushPrompt, setShowPushPrompt] = useState(false);

  // ✅ Initialize OneSignal
  useEffect(() => {
    OneSignal.initialize("c50378d3-d381-4586-aa03-5be4d41a7481");
  }, []);

  // ✅ Check AsyncStorage to determine initial route and whether to show push prompt
  useEffect(() => {
    const checkAppState = async () => {
      try {
        const hasSeenSplash = await AsyncStorage.getItem("hasSeenSplash");
        const userToken = await AsyncStorage.getItem("userToken");
        const hasAskedForPush = await AsyncStorage.getItem("hasAskedForPush");

        if (hasSeenSplash === null) {
          await AsyncStorage.setItem("hasSeenSplash", "true");
          setInitialRoute("Splash");
        } else if (userToken) {
          setInitialRoute("Tabs");
        } else {
          setInitialRoute("Login");
        }

        // Show push prompt only if not asked before
        if (hasAskedForPush === null) {
          setTimeout(() => setShowPushPrompt(true), 1000); // Delay a bit for better UX
        }
      } catch (error) {
        console.error("Error checking app state:", error);
      }
    };

    checkAppState();
  }, []);

  const handleAllowNotifications = async () => {
    OneSignal.Notifications.requestPermission(true); // Triggers system prompt
    await AsyncStorage.setItem("hasAskedForPush", "true");
    setShowPushPrompt(false);
  };

  const handleDismissPrompt = async () => {
    await AsyncStorage.setItem("hasAskedForPush", "true"); // Don’t ask again
    setShowPushPrompt(false);
  };

  if (initialRoute === null) {
    return null; // or a loading spinner
  }

  return (
    <>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName={initialRoute}>
            <Stack.Screen
              options={{ headerShown: false }}
              name="Splash"
              component={SplashScreen}
            />
            <Stack.Screen name="Onboarding" component={Onboarding} />
            <Stack.Screen
              options={{ headerShown: false }}
              name="Login"
              component={Login}
            />
            <Stack.Screen
              options={{ headerShown: false }}
              name="Register"
              component={Register}
            />
            <Stack.Screen
              options={{ headerShown: false }}
              name="Tabs"
              component={TabsNavigator}
            />
            <Stack.Screen
              name="NewsDetail"
              component={NewsDetailScreen}
              options={({ navigation }) => ({
                headerShown: true,
                headerBackTitleVisible: false,
                headerTitle: "",
                headerLeft: () => (
                  <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons
                      name="arrow-back"
                      style={{ marginLeft: 20 }}
                      size={25}
                    />
                  </TouchableOpacity>
                ),
              })}
            />
            <Stack.Screen
              name="Search results"
              component={Search}
              options={{ headerShown: false }} // Correct way to hide the header
            />

            <Stack.Screen
              name="Discover Search"
              component={DiscoverSearch}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Edit Profile"
              component={EditProfileScreen}
              options={{ headerBackTitleVisible: false }}
            />
            <Stack.Screen
              name="EmailScreen"
              component={EmailScreen}
              options={{
                header: () => null, // Hides the default header
                presentation: "modal", // Ensures the screen shows as a modal
                headerShown: false, // Hides the default header for a clean modal look
              }}
            />
            <Stack.Screen
              name="Forgot"
              component={ForgotPassword}
              options={{
                headerShown: false,
                headerBackTitleVisible: false,
                headerTitle: "",
              }}
            />
            <Stack.Screen
              name="AddPost"
              component={AddPostScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Delete"
              component={DeleteScreen}
              options={{
                presentation: "transparentModal",
                headerShown: false,
                cardStyle: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
              }}
            />
            <Stack.Screen
              name="Report user"
              component={UserScreen}
              options={{
                presentation: "transparentModal",
                headerShown: false,
                cardStyle: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
              }}
            />
            <Stack.Screen
              name="Terms"
              component={TermsOfService}
              options={{
                presentation: "transparentModal",
                headerShown: false,
                cardStyle: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
              }}
            />
          </Stack.Navigator>
          <Toast />
        </NavigationContainer>

        <Modal visible={showPushPrompt} transparent animationType="fade">
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#000000aa",
            }}
          >
            <View
              style={{
                backgroundColor: "#fff",
                padding: 20,
                borderRadius: 10,
                width: "80%",
              }}
            >
              <Text style={{ fontSize: 18, marginBottom: 10 }}>
                Stay in the loop!
              </Text>
              <Text style={{ marginBottom: 20 }}>
                Enable push notifications to get important updates and messages.
              </Text>
              <Button
                title="Enable Notifications"
                onPress={handleAllowNotifications}
              />
              <Button title="Maybe later" onPress={handleDismissPrompt} />
            </View>
          </View>
        </Modal>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
