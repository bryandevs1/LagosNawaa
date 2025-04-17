import {
  View,
  Text,
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { NewsDataType } from "../types";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import logo from "../src/assets/chat.png"; // Import your logo
import { Link, useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";

type Props = {
  slideItem: NewsDataType;
  index: number;
  scrollX: SharedValue<number>;
};

const { width } = Dimensions.get("screen");

const SliderItem = ({ slideItem, index, scrollX }: Props) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate("NewsDetail", {
      id: slideItem.id,
      title: slideItem.title?.rendered,
      authorName: slideItem._embedded?.author?.[0]?.name,
      authorImageUrl: slideItem._embedded?.author?.[0]?.avatar_urls?.["96"],
      date: slideItem.date,
      content: slideItem.content?.rendered,
      imageUrl:
        slideItem._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
        "https://via.placeholder.com/150",
    });
  };

  const [authorName, setAuthorName] = useState("Unknown Author");
  const [authorImageUrl, setAuthorImageUrl] = useState(
    Image.resolveAssetSource(logo).uri // Default to logo if no author image
  );

  const imageUrl =
    slideItem._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    "https://via.placeholder.com/150";
  const title = slideItem.title?.rendered || "No Title Available";

  const fetchAuthorData = async (authorId: number) => {
    try {
      if (!authorId) return;
      const response = await axios.get(
        `https://africanawa.com/wp-json/wp/v2/users/${authorId}`
      );
      if (response && response.data) {
        setAuthorName(response.data.name);
        setAuthorImageUrl(
          response.data.avatar_urls["96"] || Image.resolveAssetSource(logo).uri
        );
      }
    } catch (error) {
      console.log("Error fetching author data:", error);
    }
  };

  useEffect(() => {
    const embeddedAuthor = slideItem._embedded?.author?.[0];

    if (embeddedAuthor) {
      setAuthorName(embeddedAuthor.name || "AfricaNawa");
      setAuthorImageUrl(
        embeddedAuthor.avatar_urls?.["96"] || Image.resolveAssetSource(logo).uri
      );
    } else if (slideItem.author) {
      fetchAuthorData(slideItem.author);
    }
  }, [slideItem]);

  const rnStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            scrollX.value,
            [(index - 1) * width, index * width, (index + 1) * width],
            [-width * 0.15, 0, width * 0.15],
            Extrapolation.CLAMP
          ),
        },
        {
          scale: interpolate(
            scrollX.value,
            [(index - 1) * width, index * width, (index + 1) * width],
            [0.9, 1, 0.9],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  }, [scrollX, index]);
  const router = useRouter(); // Access the router object for navigation

  return (
    <TouchableOpacity onPress={handlePress}>
      <Animated.View style={[styles.itemWrapper, rnStyle]}>
        <View>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["rgba(0, 0, 0, 0.2)", "rgba(0, 0, 0, 0.7)"]}
            style={styles.gradient1}
          />
        </View>
        <LinearGradient
          colors={["rgba(0,0,0,0.0)", "transparent"]}
          style={styles.gradient}
          start={[0, 0]}
          end={[0, 1]}
        >
          <View style={styles.authorWrapper}>
            <Image
              source={{ uri: authorImageUrl }}
              style={styles.authorImage}
            />
            <Text style={styles.authorName}>{authorName}</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  itemWrapper: {
    width: width,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    width: width - 60,
    height: 120,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  gradient1: {
    position: "absolute",
    bottom: 0,
    width: width - 60,
    height: 200,
    justifyContent: "center",
    alignItems: "flex-start",
    borderRadius: 20,
  },
  image: {
    width: width - 60,
    height: 200,
    borderRadius: 20,
  },
  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  authorWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20,
  },
  authorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  authorName: {
    color: "white",
    fontSize: 14,
  },
});

export default SliderItem;
