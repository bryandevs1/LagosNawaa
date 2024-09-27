import { StyleSheet, Text, View, Image, FlatList } from "react-native";
import React, { useEffect } from "react";
import { decode, decodeEntity } from "html-entities"; // Import the decode function
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native"; // Import navigation

const Search = ({ route }: { route: any }) => {
  const decodeHtmlEntities = (str) => {
    return decodeEntity(str);
  };
  const searchResults = route?.params?.searchResults || [];
  const navigation = useNavigation(); // Access the navigation object

  useEffect(() => {
    console.log("Search results passed to component:", searchResults);
  }, [searchResults]);

  const handlePress = (item: any) => {
    // Navigate to the NewsDetail screen, passing the required data
    navigation.navigate("NewsDetail", {
      id: item.id,
      title: item.title?.rendered,
      date: item.date,
      content: decodeHtmlEntities(item.content?.rendered), // Apply decoding to content
      imageUrl:
        item._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
        "https://via.placeholder.com/150",
      category: item._embedded?.["wp:term"]?.[0]?.[0]?.name || "Uncategorized", // Get category
    });
  };

  const renderItem = ({
    item,
  }: {
    item: { title: { rendered: string }; _embedded?: any };
  }) => {
    const imageUrl =
      item._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
      "https://via.placeholder.com/150"; // Placeholder if no image available

    const category =
      item._embedded?.["wp:term"]?.[0]?.[0]?.name || "Uncategorized"; // Get category

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
              {decode(item.title.rendered)} 
            </Text>
            <Text style={styles.resultCategory}>{category}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      ) : (
        <Text style={styles.noResultsText}>No results found.</Text>
      )}
    </View>
  );
};

export default Search;

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
});
