import {
  StyleSheet,
  Text,
  View,
  Button,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SearchBar from "../../components/SearchBar";
import { MaterialIcons } from "@expo/vector-icons"; // For the green tick
import { useIsFocused, useNavigation } from "@react-navigation/native";

type Props = {};

const Page = (props: Props) => {
  const navigation = useNavigation();
  const { top: safeTop } = useSafeAreaInsets();
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const getCategories = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert("Error", "You are not logged in. Please log in again.");
        return;
      }

      const URL = "https://lagosnawa.com/wp-json/wp/v2/categories?per_page=100";

      const response = await axios.get(URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response?.data?.length) {
        setCategories([{ id: 0, name: "All", slug: "all" }, ...response.data]);
      } else {
        setCategories([]);
        Alert.alert("Error", "Failed to load categories. Try again later.");
      }
    } catch (err: any) {
      console.log("Error Message: ", err.message);
    }
  };

  const isFocused = useIsFocused(); // Add this to track if the page is focused

  useEffect(() => {
    if (isFocused) {
      getCategories();
    }
  }, [isFocused]); // Rerun when `isFocused` changes

  const handleSelectCategory = (id: number) => {
    if (selectedCategories.includes(id)) {
      // If the category is already selected, deselect it
      setSelectedCategories((prev) =>
        prev.filter((categoryId) => categoryId !== id)
      );
    } else {
      // If the category is not selected, add it
      setSelectedCategories((prev) => [...prev, id]);
    }
  };

  const isCategorySelected = (id: number) => {
    return selectedCategories.includes(id);
  };

  const handleSearch = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        console.log("No token found, please log in.");
        return;
      }

      // Base URL
      const baseURL = "https://lagosnawa.com/wp-json/wp/v2/posts?_embed";

      // Prepare the query if searchQuery is provided
      const queryParam = searchQuery.trim()
        ? `&search=${searchQuery.trim()}`
        : "";

      // Prepare the category filter if categories are selected
      const categoryParam = selectedCategories.length
        ? `&categories=${selectedCategories.join(",")}`
        : "";

      // If no search query and no categories are selected, return early and disable search
      if (!queryParam && !categoryParam) {
        Alert.alert(
          "No Search",
          "Please input a search query or select a category."
        );
        return;
      }

      // Combine the search query and category filter
      const fullURL = `${baseURL}${queryParam}${categoryParam}`;

      // Fetch data
      const response = await axios.get(fullURL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Navigate to Search results if data is found
      if (response && response.data) {
        navigation.navigate("Discover Search", {
          searchResults: [], // Initial empty results
          searchQuery, // Pass search query
          selectedCategories, // Pass selected categories
        });
      } else {
        Alert.alert("No Results", "No data found.");
      }
    } catch (err: any) {
      console.log("Error Message: ", err.message);
      Alert.alert("Error", "Something went wrong while searching.");
    }
    console.log("Search query: ", searchQuery);
    console.log("Selected categories: ", selectedCategories);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 10 }}
        keyboardShouldPersistTaps="handled"
      >
        {" "}
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        {/* Custom Categories Section */}
        <View style={{ marginTop: 20 }}>
          <Text style={styles.text}>Explore Categories</Text>
          <View style={styles.gridContainer}>
            {categories.length > 0 ? (
              categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    isCategorySelected(category.id) &&
                      styles.categoryItemActive,
                  ]}
                  onPress={() => handleSelectCategory(category.id)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      isCategorySelected(category.id) &&
                        styles.categoryTextActive,
                    ]}
                  >
                    {category.name}
                  </Text>
                  {isCategorySelected(category.id) && (
                    <MaterialIcons
                      name="check-circle"
                      size={20}
                      color="green"
                      style={styles.greenTick}
                    />
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <Text>Loading categories...</Text>
            )}
          </View>
        </View>
        {/* Search Button */}
        <View style={styles.searchButtonContainer}>
          <Button
            title="Search"
            onPress={() => {
              console.log("Search Button Pressed");
              handleSearch(); // Trigger search
            }}
            disabled={!searchQuery && selectedCategories.length === 0}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 15,
    marginBottom: 10,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  categoryItem: {
    width: "100%", // Adjusts size for 2 items per row
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    position: "relative", // For positioning the tick icon
  },
  categoryItemActive: {
    backgroundColor: "#e0f7e0", // Light green background for active category
    borderColor: "#4caf50", // Green border
  },
  categoryText: {
    fontSize: 14,
    color: "gray",
  },
  categoryTextActive: {
    color: "#4caf50", // Green text for active category
  },
  greenTick: {
    position: "absolute",
    top: 5,
    right: 5,
  },
  searchButtonContainer: {
    margin: 20,
  },
});
