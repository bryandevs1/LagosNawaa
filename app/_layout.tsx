import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "./(tabs)/index";
import Settings from "./(tabs)/settings";
import Discover from "./(tabs)/discover";
import Saved from "./(tabs)/saved";
import { StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons"; // Import FontAwesome 6 icons

const Tab = createBottomTabNavigator();

export default function TabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          

          // Assign FontAwesome icons based on route name
          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "Discover") {
            iconName = "search";
          } else if (route.name === "Saved") {
            iconName = "bookmark";
          } else if (route.name === "Settings") {
            iconName = "cogs";
          }

          // Return the FontAwesome icon component with custom size, color, and glow effect
          return (
            <FontAwesome5
              name={iconName}
              size= "20"
              color={color}
              style={styles.icon}
            />
          );
        },
        tabBarActiveTintColor: "#a80d0d", // Color for active icons
        tabBarInactiveTintColor: "#999", // Color for inactive icons
        tabBarStyle: styles.tabBar, // Style for the floating tab bar
        tabBarShowLabel: false, // Hide labels
      })}
    >
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
    bottom: 20, // Space from bottom
    left: 20, // Space from left
    right: 20, // Space from right
    elevation: 5, // Elevation for shadow (Android)
    backgroundColor: "rgba(255, 255, 255, 0.9)", // Glassy effect
    borderRadius: 30, // Rounded corners
    height: 70, // Increased height of the tab bar to ensure full icon visibility
    borderWidth: 1, // Border for glassy effect
    borderColor: "rgba(255, 255, 255, 0.3)", // Light glassy border
    shadowColor: "#000", // Shadow color (iOS)
    shadowOffset: { width: 0, height: 10 }, // Shadow offset (iOS)
    shadowOpacity: 0.1, // Shadow opacity (iOS)
    shadowRadius: 20, // Shadow radius (iOS)
    paddingBottom: 0, // Add some bottom padding to ensure icons fit
  },
  icon: {
    shadowOffset: { width: 0, height: 0 },
  },
});
