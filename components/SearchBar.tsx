import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

const SearchBar = ({ value, onChangeText }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.searchBar} activeOpacity={1}>
        <Ionicons name="search-outline" size={24} color="black" />
        <TextInput
          style={styles.input}
          placeholder="Search"
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor="#999"
          returnKeyType="search"
          autoCorrect={false}
          blurOnSubmit
        />
      </TouchableOpacity>
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
  },
  searchBar: {
    height: 50,
    width: "90%",
    borderRadius: 25,
    backgroundColor: "#E6E6E6",
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
});
