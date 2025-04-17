import {
  Button,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Header from "../../components/Header";
import SearchBar from "../../components/SearchBar";
import { NewsDataType } from "../../types";
import axios from "axios";
import BreakingNews from "../../components/BreakingNews";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Categories from "../../components/Categories";
import NewsList from "../../components/NewsList";
import { decode } from "html-entities";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const Page = () => {
  const { top: safeTop } = useSafeAreaInsets();
  const [breakingNews, setBreakingNews] = useState<NewsDataType[]>([]);
  const [news, setNews] = useState<NewsDataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const isFocused = useIsFocused();
  const scrollRef = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    if (isFocused) {
      getBreakingNews();
      getNews(0);
    }
  }, [isFocused]);

  const getBreakingNews = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      const URL =
        "https://africanawa.com/wp-json/wp/v2/posts?per_page=7&_embed&orderby=date&order=desc";

      const headers = token ? { Authorization: `Bearer ${token}` } : {}; // Use header only if token exists

      const response = await axios.get(URL, { headers });

      if (response && response.data) {
        const decodedData = response.data.map((post: any) => ({
          ...post,
          title: { rendered: decode(post.title.rendered) },
          content: { rendered: decode(post.content.rendered) },
        }));
        setBreakingNews(decodedData);
      }
    } catch (err) {
      console.log("Error Message: ", err.message);
    }
  };

  const [totalPages, setTotalPages] = useState(1);

  const getNews = async (categoryId = 0, page = 1) => {
    let categoryString = categoryId > 0 ? `&categories=${categoryId}` : ""; // Only add category if valid

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      const URL = `https://africanawa.com/wp-json/wp/v2/posts?per_page=30&page=${page}&_embed${categoryString}`;
      console.log("Fetching:", URL);

      const headers = token ? { Authorization: `Bearer ${token}` } : {}; // Use header only if token exists

      const response = await axios.get(URL, { headers });

      if (response && response.data) {
        const decodedData = response.data.map((post) => ({
          ...post,
          title: { rendered: decode(post.title.rendered) },
          content: { rendered: decode(post.content.rendered) },
        }));

        setNews((prevNews) =>
          page === 1 ? decodedData : [...prevNews, ...decodedData]
        );
        setHasMore(response.data.length >= 10);
      }
    } catch (err) {
      console.log("Error Message:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage); // Update state (won't reflect immediately)
      getNews(selectedCategory, nextPage); // Fetch with correct page number
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setPage(1);
    getNews(categoryId, 1);
    scrollRef.current.scrollTo({ y: 0, animated: true });
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate("Search results", { searchQuery });
    } else {
      console.log("Search query is empty.");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: safeTop }]}>
      <Header />
      <TouchableOpacity style={styles.searchBar} activeOpacity={1}>
        <Ionicons name="search-outline" size={24} color="black" />
        <TextInput
          style={styles.input}
          placeholder="Search"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          placeholderTextColor="#999"
          returnKeyType="search"
          autoCorrect={false}
          blurOnSubmit
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons
            name="arrow-forward-circle-outline"
            size={24}
            color="#4c270a"
          />
        </TouchableOpacity>
      </TouchableOpacity>
      <ScrollView
        ref={scrollRef}
        style={{ marginBottom: 90 }}
        stickyHeaderIndices={[1]}
      >
        <BreakingNews newsList={breakingNews} />
        <View style={styles.stickyCategoriesContainer}>
          <Categories onCategoryChanged={handleCategoryChange} />
        </View>
        <View style={{ backgroundColor: "#fff" }}>
          <NewsList newsList={news} />
        </View>
        {hasMore && !loading && (
          <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
            <Text style={styles.loadMoreText}>Load More</Text>
          </TouchableOpacity>
        )}
        {loading && <ActivityIndicator size="large" color="#0000ff" />}
      </ScrollView>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddPost")}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stickyCategoriesContainer: {
    backgroundColor: "#fff",
    zIndex: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    margin: 10,
    backgroundColor: "#f9f9f9",
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  searchButton: {
    marginLeft: 10,
    padding: 5,
  },
  loadMoreButton: {
    paddingVertical: 12,
    backgroundColor: "#4c270a",
    borderRadius: 8,
    alignSelf: "center",
    width: "90%",
    alignItems: "center",
  },
  loadMoreText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  fab: {
    position: "absolute",
    bottom: 110, // Adjust for safe area
    right: 20, // Align to bottom-right
    backgroundColor: "#4c270a", // Your theme color
    width: 80,
    height: 80,
    borderRadius: 40, // Make it circular
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5, // Android shadow
  },
});
