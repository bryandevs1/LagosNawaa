import React, { useState, useLayoutEffect, useEffect } from "react";
import { StyleSheet, Text, View, Image, ScrollView, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; // For the favorite icon
import RenderHtml from "react-native-render-html";
import { Dimensions, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { refreshBookmarks } from "../(tabs)/saved"; // Replace with the correct path to SavedScreen

const { width } = Dimensions.get("window");

const NewsDetails = ({ navigation }) => {
  const route = useRoute();

  const { id, title, authorName, authorImageUrl, date, content, imageUrl } =
    route.params;

  const [isFavorite, setIsFavorite] = useState(false); // Favorite state

  // Check if the article is bookmarked
  const checkIfBookmarked = async () => {
    try {
      const bookmarks = await AsyncStorage.getItem("bookmarks");
      if (bookmarks) {
        const parsedBookmarks = JSON.parse(bookmarks);
        if (parsedBookmarks.includes(id)) {
          setIsFavorite(true);
        }
      }
    } catch (error) {
      console.error("Error checking bookmarks:", error);
    }
  };

  // Save or remove the article from bookmarks
  const toggleFavorite = async () => {
    try {
      let bookmarks = await AsyncStorage.getItem("bookmarks");
      let updatedBookmarks = [];

      if (bookmarks) {
        bookmarks = JSON.parse(bookmarks);

        if (isFavorite) {
          // Remove the article if it's already bookmarked
          updatedBookmarks = bookmarks.filter(
            (bookmarkId: string) => bookmarkId !== id
          );
        } else {
          // Add the article to bookmarks
          updatedBookmarks = [...bookmarks, id];
        }
      } else {
        // If no bookmarks exist, create a new array with this article
        updatedBookmarks = [id];
      }

      await AsyncStorage.setItem("bookmarks", JSON.stringify(updatedBookmarks));
      setIsFavorite(!isFavorite); // Toggle the favorite state
      Alert.alert(
        "Success",
        isFavorite ? "Removed from bookmarks" : "Added to bookmarks"
      );

      // Trigger refetch in SavedScreen
      // Refresh the SavedScreen when bookmarks change
      navigation.navigate("Saved", { refresh: true });
    } catch (error) {
      console.error("Error updating bookmarks:", error);
    }
  };

  // Set the favorite button in the header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={toggleFavorite}
          style={styles.favoriteButton}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={30}
            color={isFavorite ? "red" : "black"}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, isFavorite]);

  // Check if the article is bookmarked when the component mounts
  useEffect(() => {
    checkIfBookmarked();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* News Image */}
        <Image source={{ uri: imageUrl }} style={styles.image} />

        {/* Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Author Info and Date */}
        <View style={styles.authorRow}>
          <Image source={{ uri: authorImageUrl }} style={styles.authorImage} />
          <View>
            <Text style={styles.authorName}>{authorName}</Text>
            <Text style={styles.date}>{date}</Text>
          </View>
        </View>

        {/* Render HTML Content */}
        <RenderHtml contentWidth={width} source={{ html: content }} />
      </ScrollView>
    </View>
  );
};

export default NewsDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginTop: 20, // To account for the header
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
    color: "#333",
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  authorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  authorName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  date: {
    fontSize: 14,
    color: "#666",
  },
  favoriteButton: {
    marginRight: 15,
  },
});
