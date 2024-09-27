import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import SplashScreen from "./src/screens/SplashScreen";
import { Onboarding } from "./src/screens/Onboarding";
import Login from "./src/screens/Login";
import Register from "./src/screens/Register";
import TabsNavigator from "./app/_layout.tsx"; // Import your TabsNavigator
import Toast from "react-native-toast-message";
import NewsDetailScreen from "./app/news/[id]";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import Search from "./components/Search";

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Tabs">
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
            component={TabsNavigator} // Add the TabsNavigator here
          />
          <Stack.Screen
            name="NewsDetail"
            component={NewsDetailScreen}
            options={({ navigation }) => ({
              headerShown: true,
              headerBackTitleVisible: false,
              headerTitle: "", // Remove the title
              // Add custom back arrow button
              headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Ionicons
                    name="arrow-back" // Custom back arrow icon
                    style={{ marginLeft: 20 }}
                    size={25} // Customize the size and style
                  />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen name="Search results" component={Search} />
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
