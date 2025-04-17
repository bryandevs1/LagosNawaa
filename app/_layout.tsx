import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "./(tabs)/index";
import Settings from "./(tabs)/settings";
import Discover from "./(tabs)/discover";
import Saved from "./(tabs)/saved";
import { Platform, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons"; // Import FontAwesome 6 icons
import { RouteProp } from "@react-navigation/native";

type TabParamList = {
  Home: undefined;
  Discover: undefined;
  Saved: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const screenOptions = ({
  route,
}: {
  route: RouteProp<TabParamList, keyof TabParamList>;
}) => ({
  tabBarIcon: ({ focused, color }: { focused: boolean; color: string }) => {
    let iconName: string;

    switch (route.name) {
      case "Home":
        iconName = "home";
        break;
      case "Discover":
        iconName = "search";
        break;
      case "Saved":
        iconName = "bookmark";
        break;
      case "Settings":
        iconName = "cogs";
        break;
      default:
        iconName = "circle"; // Fallback icon
    }

    return <FontAwesome5 name={iconName} size={20} color={color} />;
  },
  tabBarActiveTintColor: "#4c270a",
  tabBarInactiveTintColor: "#999",
  tabBarStyle: styles.tabBar,
  tabBarShowLabel: false,
  headerShown: false,
});
export default function TabsNavigator() {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Discover" component={Discover} />
      <Tab.Screen name="Saved" component={Saved} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute", // Make tab bar float
    backgroundColor: "rgb(255, 255, 255)", // Glassy effect
    paddingTop: Platform.OS === "android" ? 0 : 15, // Increased padding for Android
    borderRadius: 30, // Rounded corners
    height: 80, // Increased height of the tab bar to ensure full icon visibility
    borderWidth: 1, // Border for glassy effect
    borderColor: "rgba(255, 255, 255, 0.3)", // Light glassy border
    shadowColor: "#000", // Shadow color (iOS)
    shadowOffset: { width: 0, height: 10 }, // Shadow offset (iOS)
    shadowOpacity: 0.1, // Shadow opacity (iOS)
    shadowRadius: 20, // Shadow radius (iOS)
  },
  icon: {
    shadowOffset: { width: 0, height: 0 },
  },
});
