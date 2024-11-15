import {
  Button,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TextInput,
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
import { ScrollView } from "react-native-gesture-handler";
import { decode } from "html-entities";
import { useIsFocused, useNavigation } from "@react-navigation/native";

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
  const scrollRef = useRef(null); // Ref to control the scroll position

  useEffect(() => {
    if (isFocused) {
      getBreakingNews();
      getNews(0);
    }
  }, [isFocused]);

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
      categoryString = `&categories=${categoryId}`;
    }
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        console.log("No token found, please log in.");
        return;
      }

      setLoading(true);

      const URL = `https://lagosnawa.com/wp-json/wp/v2/posts?per_page=10&page=${page}&_embed${categoryString}`;

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
          setNews(decodedData);
        } else {
          setNews((prevNews) => [...prevNews, ...decodedData]);
        }

        setHasMore(response.data.length >= 10);
      }
    } catch (err) {
      console.log("Error Message: ", err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage((prevPage) => prevPage + 1);
      getNews(selectedCategory, page + 1);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setPage(1);
    getNews(categoryId, 1);
    scrollRef.current.scrollTo({ y: 0, animated: true });
  };
  const navigation = useNavigation();

  const handleSearch = () => {
    navigation.navigate("Discover", { searchQuery });
  };

  return (
    <View style={[styles.container, { paddingTop: safeTop }]}>
      <Header />
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSearch={handleSearch} // Trigger navigation to Discover
      />
      <ScrollView ref={scrollRef} stickyHeaderIndices={[1]}>
        <BreakingNews newsList={breakingNews} />
        <View style={styles.stickyCategoriesContainer}>
          <Categories onCategoryChanged={handleCategoryChange} />
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <View style={{ backgroundColor: "#fff" }}>
            <NewsList newsList={news} onEndReached={loadMore} />
          </View>
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
  stickyCategoriesContainer: {
    backgroundColor: "#fff",
    zIndex: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
