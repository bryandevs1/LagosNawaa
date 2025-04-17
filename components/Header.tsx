import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Header = () => {
  const [userName, setUserName] = useState<string | null>(null);

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

  return (
    <View
      style={{
        paddingHorizontal: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        marginTop: 10,
      }}
    >
      <Image
        source={{
          uri: "https://africanawa.com/wp-content/themes/gorgo/assets/images/avatars/user-avatar.png",
        }}
        style={styles.profileImg}
      />
      <View>
        {/* Display the fetched user name or a default if not available */}
        <Text style={{ fontWeight: "bold" }}>{userName || "Guest User"}</Text>
        <Text style={{ color: "gray" }}>Lagos, Nigeria</Text>
      </View>
      <TouchableOpacity onPress={() => alert("Notifications")}>
        <Ionicons name="notifications" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
};

export default Header;

const styles = {
  profileImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
};
