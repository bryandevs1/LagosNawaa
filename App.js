import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
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

const Stack = createStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkAppState = async () => {
      try {
        const hasSeenSplash = await AsyncStorage.getItem("hasSeenSplash");
        const userToken = await AsyncStorage.getItem("userToken");

        console.log("hasSeenSplash:", hasSeenSplash);
        console.log("userToken:", userToken);

        if (hasSeenSplash === null) {
          // First launch, navigate to Splash
          await AsyncStorage.setItem("hasSeenSplash", "true");
          setInitialRoute("Splash");
        } else if (userToken) {
          // User is logged in, navigate to Tabs
          setInitialRoute("Tabs");
        } else {
          // User is not logged in, navigate to Login
          setInitialRoute("Login");
        }
      } catch (error) {
        console.error("Error checking app state:", error);
      }
    };

    checkAppState();
  }, []);

  if (initialRoute === null) {
    // Show a loading screen while checking AsyncStorage
    return null;
  }

  return (
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
            options={{ headerBackTitleVisible: false }}
          />
          <Stack.Screen
            name="Discover Search"
            component={DiscoverSearch}
            options={{
              headerTitleVisible: false,
              headerBackTitleVisible: false,
              headerTitle: "",
            }}
          />
          <Stack.Screen
            name="EditProfile"
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
              presentation: "transparentModal",
              headerShown: false,
              cardStyle: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
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
      <StatusBar style="auto" />
    </SafeAreaProvider>
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
