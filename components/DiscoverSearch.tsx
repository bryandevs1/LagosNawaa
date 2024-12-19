import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { decode } from "html-entities";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const DiscoverSearch = ({ route }: { route: any }) => {
  const searchResults = route?.params?.searchResults || [];
  const navigation = useNavigation();

  const { searchQuery, selectedCategories } = route.params || {};
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          console.log("No token found, please log in.");
          setLoading(false);
          return;
        }

        const baseURL = "https://lagosnawa.com/wp-json/wp/v2/posts?_embed";
        const queryParam = searchQuery ? `&search=${searchQuery}` : "";
        const categoryParam = selectedCategories.length
          ? `&categories=${selectedCategories.join(",")}`
          : "";
        const URL = `${baseURL}${queryParam}${categoryParam}`;

        console.log("Fetching URL:", URL);
        const response = await axios.get(URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setResults(response.data || []);
      } catch (err) {
        console.log("Error fetching search results:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery, selectedCategories]);

  const handlePress = (item: any) => {
    navigation.navigate("NewsDetail", {
      id: item.id,
      title: item.title?.rendered,
      date: item.date,
      content: decode(item.content?.rendered),
      imageUrl:
        item._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
        "https://via.placeholder.com/150",
      category: item._embedded?.["wp:term"]?.[0]?.[0]?.name || "Uncategorized",
    });
  };

  const renderItem = ({ item }: { item: any }) => {
    const imageUrl =
      item._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
      "https://via.placeholder.com/150";
    const category =
      item._embedded?.["wp:term"]?.[0]?.[0]?.name || "Uncategorized";

    return (
      <TouchableOpacity onPress={() => handlePress(item)}>
        <View style={styles.resultItem}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.resultImage}
            resizeMode="cover"
          />
          <View style={styles.textContainer}>
            <Text style={styles.resultTitle}>
              {decode(item.title?.rendered || "")}
            </Text>
            <Text style={styles.resultCategory}>
              {category || "Uncategorized"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      ) : (
        <Text style={styles.noResultsText}>
          {searchQuery || selectedCategories.length > 0
            ? "No results found."
            : "Enter a search query or select categories."}
        </Text>
      )}
    </View>
  );
};

export default DiscoverSearch;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  resultItem: {
    flexDirection: "row",
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  resultImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "bold",
    flexShrink: 1,
  },
  resultCategory: {
    fontSize: 14,
    color: "#666",
  },
  noResultsText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#999",
  },
  loader: {
    marginTop: 20,
  },
});
