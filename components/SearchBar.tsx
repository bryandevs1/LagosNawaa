import { View, Text, StyleSheet, TextInput } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

type Props = {};

const SearchBar = ({ value, onChangeText }) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={24} color="black" />
        <TextInput
          placeholder="Search"
          value={value}
          onChangeText={onChangeText}
        />
      </View>
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  searchBar: {
    height: 40,
    width: "90%",
    borderRadius: 20,
    backgroundColor: "#E6E6E6",
    paddingVertical: 10,
    paddingHorizontal: 10,
    display: "flex",
    flexDirection: "row",
    gap: 10,
  },
  search: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: "#E6E6E6",
    justifyContent: "flex-end",
    alignSelf: "flex-end",
    marginLeft: 10,
  },
});
