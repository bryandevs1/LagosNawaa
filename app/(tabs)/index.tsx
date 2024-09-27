import {
  Button,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Header from "../../components/Header";
import SearchBar from "../../components/SearchBar";
import { NewsDataType } from "../../types";
import axios from "axios";
import BreakingNews from "../../components/BreakingNews";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Categories from "../../components/Categories";
import NewsList from "../../components/NewsList";
import { ScrollView } from "react-native-gesture-handler";
import { decode } from "html-entities"; // Import the decode function
import { useIsFocused } from "@react-navigation/native";

type Props = {};

const Page = (props: Props) => {
  const decodeHtmlEntities = (str) => {
    return decode(str);
  };
  const { top: safeTop } = useSafeAreaInsets();
  const [breakingNews, setBreakingNews] = useState<NewsDataType[]>([]);
  const [news, setNews] = useState<NewsDataType[]>([]);
  const [loading, setLoading] = useState(false); // State to manage loading
  const [page, setPage] = useState(1); // Track the current page
  const [hasMore, setHasMore] = useState(true); // To check if there are more posts

  const isFocused = useIsFocused(); // Add this to track if the page is focused

  useEffect(() => {
    if (isFocused) {
      getBreakingNews(); // Refetch breaking news when the page is focused
      getNews(0); // Refetch news when the page is focused
    }
  }, [isFocused]); // Rerun when `isFocused` changes

  const getBreakingNews = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.log("No token found, please log in.");
        return;
      }
      const URL =
        "https://lagosnawa.com/wp-json/wp/v2/posts?per_page=7&_embed&orderby=date&order=desc";
      const response = await axios.get(URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response && response.data) {
        // Decode the title and content before setting it in the state
        const decodedData = response.data.map((post: any) => ({
          ...post,
          title: {
            rendered: decode(post.title.rendered),
          },
          content: {
            rendered: decode(post.content.rendered),
          },
        }));
        setBreakingNews(decodedData);
      }
    } catch (err) {
      console.log("Error Message: ", err.message);
    }
  };

  const getNews = async (categoryId: number = 0, page = 1) => {
    let categoryString = "";
    if (categoryId !== 0) {
      categoryString = `&categories=${categoryId}`; // Correctly use category ID for filtering
    }
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        console.log("No token found, please log in.");
        return;
      }

      setLoading(true);

      const URL = `https://lagosnawa.com/wp-json/wp/v2/posts?per_page=100&page=${page}&_embed&${categoryString}`;

      const response = await axios.get(URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response && response.data) {
        const decodedData = response.data.map((post: any) => ({
          ...post,
          title: {
            rendered: decode(post.title.rendered),
          },
          content: {
            rendered: decode(post.content.rendered),
          },
        }));

        if (page === 1) {
          setNews(decodedData); // First page load
        } else {
          setNews((prevNews) => [...prevNews, ...decodedData]); // Append more data
        }

        if (response.data.length < 10) {
          setHasMore(false); // No more pages if fewer posts are returned
        }
      }
    } catch (err) {
      console.log("Error Message: ", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load more function
  const loadMore = () => {
    if (hasMore && !loading) {
      setPage((prevPage) => prevPage + 1);
      getNews(page + 1);
    }
  };
  const [selectedCategory, setSelectedCategory] = useState("all"); // Default to 'all'

  // Function to handle category change
  const handleCategoryChange = (categoryId: number) => {
    console.log("Selected Category ID: ", categoryId);
    setPage(1); // Reset the page number to 1 when switching categories
    getNews(categoryId, 1); // Fetch news for the selected category ID, reset to page 1
  };

  return (
    <View style={[styles.container, { paddingTop: safeTop }]}>
      <Header />
      <SearchBar />
      <ScrollView>
        <BreakingNews newsList={breakingNews} />
        <Categories onCategoryChanged={handleCategoryChange} />
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <NewsList newsList={news} />
        )}
      </ScrollView>
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
