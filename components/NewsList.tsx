import { View, Text, StyleSheet, FlatList, Image } from "react-native";
import React from "react";
import { NewsDataType } from "../types";
import logo from "../src/assets/chat.png"; // Default logo if author image is unavailable
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";

type Props = {
  newsList: Array<NewsDataType>;
};

const NewsList = ({ newsList }: Props) => {
  const navigation = useNavigation();

  // Define handlePress to take an item parameter
  const handlePress = (item: NewsDataType) => {
    navigation.navigate("NewsDetail", {
      id: item.id, // Use item instead of slideItem
      title: item.title?.rendered,
      authorName: item._embedded?.author?.[0]?.name,
      authorImageUrl: item._embedded?.author?.[0]?.avatar_urls?.["96"],
      date: item.date,
      content: item.content?.rendered,
      imageUrl:
        item._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
        "https://via.placeholder.com/150",
    });
  };

  return (
    <FlatList
      data={newsList}
      keyExtractor={(item) => item.id.toString()} // Use `id` for key
      renderItem={({ item }) => {
        const imageUrl =
          item._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
          "https://via.placeholder.com/150";
        const title = item.title?.rendered || "No Title Available";

        const authorName = item._embedded?.author?.[0]?.name || "LagosNawa";
        const authorImageUrl =
          item._embedded?.author?.[0]?.avatar_urls?.["96"] ||
          Image.resolveAssetSource(logo).uri;
        const category =
          item._embedded?.["wp:term"]?.[0]?.[0]?.name || "Uncategorized";

        return (
          <TouchableOpacity onPress={() => handlePress(item)}>
            <View style={styles.newsItem}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.newsImage}
                onError={() => console.log("Failed to load image: ", imageUrl)}
              />
              <View style={styles.textContainer}>
                <Text style={styles.cateroy}>{category}</Text>
                <Text style={styles.title}>{title}</Text>
                <View style={styles.authorWrapper}>
                  <Image
                    source={{ uri: authorImageUrl }}
                    style={styles.authorImage}
                    onError={() =>
                      console.log(
                        "Failed to load author image: ",
                        authorImageUrl
                      )
                    }
                  />
                  <Text style={styles.authorName}>{authorName}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
};

export default NewsList;

const styles = StyleSheet.create({
  newsItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    flexDirection: "row",
    marginBottom: 20,
    gap: 10,
  },
  newsImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  cateroy: {
    fontSize: 12,
  },
  authorWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  authorImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  authorName: {
    fontSize: 14,
    color: "#666",
  },
});
