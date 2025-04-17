import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { decode } from "html-entities"; // Import the decode function
import { useIsFocused, useNavigation } from "@react-navigation/native";

const SavedScreen = () => {
  const [bookmarkedNews, setBookmarkedNews] = useState<string[]>([]);
  const [newsData, setNewsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false); // State to manage loading
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  // Add this to force refresh when bookmarks change
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshBookmarks = async () => {
    await fetchBookmarks();
    setRefreshKey((prev) => prev + 1); // Force refresh
  };

  // Fetch bookmarked news IDs from AsyncStorage
  const fetchBookmarks = async () => {
    try {
      const bookmarks = await AsyncStorage.getItem("bookmarks");
      if (bookmarks) {
        const parsedBookmarks = JSON.parse(bookmarks);
        console.log("Fetched Bookmarks:", parsedBookmarks); // Debug
        setBookmarkedNews(parsedBookmarks);
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    }
  };

  // Fetch news data by IDs
  const fetchNewsById = async (newsIds: string[]) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");

      const headers = token ? { Authorization: `Bearer ${token}` } : {}; // Use header only if token exists

      const requests = newsIds.map((id) =>
        axios.get(`https://africanawa.com/wp-json/wp/v2/posts/${id}?_embed`, {
          headers,
        })
      );

      const responses = await Promise.all(requests);
      const decodedData = responses.map((response) => {
        const post = response.data;
        return {
          ...post,
          title: {
            rendered: decode(post.title.rendered),
          },
          content: {
            rendered: decode(post.content.rendered),
          },
        };
      });
      setNewsData(decodedData);
    } catch (error) {
      console.error("Error fetching news data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [isFocused]);

  useEffect(() => {
    if (bookmarkedNews.length > 0) {
      fetchNewsById(bookmarkedNews); // Fetch news details based on IDs
    }
  }, [bookmarkedNews]);

  const renderNewsItem = ({ item }: { item: any }) => {
    // Log the item to ensure it's correctly fetched
    console.log("Rendering item:", item);

    // Extract values with fallback in case they are undefined
    const imageUrl =
      item._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
      "https://via.placeholder.com/150";
    const author = item._embedded?.author?.[0];
    const authorName = author?.name || "Africanawa";
    const authorImageUrl = author?.avatar_urls?.[96] || "";
    const title = item.title?.rendered || "No Title Available";
    const content = item.content?.rendered || "No content available";
    const id = item.id || 0; // Ensure the ID exists

    // Log the data being passed to the navigation
    console.log("Navigating with data:", {
      id,
      title,
      authorName,
      authorImageUrl,
      content,
      imageUrl,
    });

    return (
      <TouchableOpacity
        style={styles.newsItem}
        onPress={() => {
          // Make sure all values passed to navigation are defined
          navigation.navigate("NewsDetail", {
            id, // ID for the post
            title, // Post title
            authorName, // Author name
            authorImageUrl, // Author image
            date: item.date || "No date", // Date with fallback
            content, // Post content
            imageUrl, // Post image
          });
        }}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.newsImage} />
        ) : (
          <View style={styles.placeholderImage} />
        )}
        <View style={styles.newsTextContainer}>
          <Text style={styles.newsTitle}>{title}</Text>
          <Text style={styles.newsAuthor}>by {authorName}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (newsData.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <Text style={styles.none}>No saved bookmarks yet!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} key={refreshKey}>
      <Text style={styles.bookmarkTitle}>Saved Bookmarks</Text>
      <FlatList
        data={newsData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNewsItem}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

export default SavedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 100,
  },
  bookmarkTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#4c270a",
    textShadowColor: "rgba(0, 0, 0, 0.2)", // Adds a cool shadow effect
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    marginBottom: 20, // Space between the title and the list
    marginTop: -30, // Space between the title and the news list
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  newsItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  newsImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  newsTextContainer: {
    flex: 1,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  newsAuthor: {
    fontSize: 14,
    color: "#666",
  },
  buttonContainer: {
    width: "70%", // Full width of the container
    alignContent: "center",
    alignSelf: "center",
    backgroundColor: "#4c270a", // Button background color
    borderRadius: 25, // For cylindrical appearance
    paddingVertical: 15, // Vertical padding for height
    paddingHorizontal: 30, // Horizontal padding for width
    alignItems: "center", // Center the text horizontally
    justifyContent: "center", // Center the text vertically
    marginVertical: 20, // Margin for spacing
  },
  none: {
    color: "#fff", // Text color
    fontSize: 16,
    fontWeight: "800",
  },
});
