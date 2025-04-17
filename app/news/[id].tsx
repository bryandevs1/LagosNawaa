import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Alert,
  FlatList,
  TextInput,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import RenderHtml from "react-native-render-html";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import StyledButton from "../../components/StyledButton";
import KeyboardAvoidingWrapper from "../../components/KeyboardAvoidingView";
import immagee from "../../src/assets/chat.png";
import { FontAwesome } from "@expo/vector-icons";
import axios from "axios";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";
import he from "he"; // For decoding HTML entities

const { width } = Dimensions.get("window");

const NewsDetails = ({ navigation }) => {
  const route = useRoute();
  const { id, title, authorName, authorImageUrl, date, content, imageUrl } =
    route.params;

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const token = AsyncStorage.getItem("userToken");
  const [bookmarkedNews, setBookmarkedNews] = useState<string[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [relatedNews, setRelatedNews] = useState([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  const [categoryId, setCategoryId] = useState(null); // Add this state
  // Fetch user data from AsyncStorage and comments when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      const storedName = await AsyncStorage.getItem("userName");
      const storedEmail = await AsyncStorage.getItem("userEmail");
      if (storedName && storedEmail) {
        setUserName(storedName);
        setUserEmail(storedEmail);
      }
      const bookmarks = await AsyncStorage.getItem("bookmarks");
      if (bookmarks) {
        setBookmarkedNews(JSON.parse(bookmarks));
      }
    };

    fetchUserData();
    fetchComments(); // Fetch comments for the post
    fetchRelatedNews(); // Add this line
  }, [id]);

  const fetchPostCategories = async () => {
    try {
      const response = await axios.get(
        `https://africanawa.com/wp-json/wp/v2/posts/${id}`
      );
      // Assuming the API returns categories as an array of IDs
      if (response.data.categories && response.data.categories.length > 0) {
        setCategoryId(response.data.categories[0]); // Take the first category
        return response.data.categories[0]; // Return for immediate use
      }
      return null;
    } catch (error) {
      console.error("Error fetching post categories:", error);
      return null;
    }
  };
  const fetchRelatedNews = async () => {
    try {
      setIsLoadingRelated(true);

      // First get the category ID if we don't have it
      const catId = categoryId || (await fetchPostCategories());
      if (!catId) {
        setRelatedNews([]);
        return;
      }

      const response = await axios.get(
        `https://africanawa.com/wp-json/wp/v2/posts?categories=${catId}&per_page=10&exclude=${id}&_embed`
      );
      setRelatedNews(response.data);
    } catch (error) {
      console.error("Error fetching related news:", error);
      setRelatedNews([]);
    } finally {
      setIsLoadingRelated(false);
    }
  };

  const showToast = (type, message) => {
    Toast.show({
      type: type,
      text1: type.charAt(0).toUpperCase() + type.slice(1) + " Message",
      text2: message,
      position: "top",
      visibilityTime: 4000,
      topOffset: Platform.OS === "ios" ? 100 : 20, // Adjust for iOS
    });
  };
  const handleReport = async () => {
    if (!reportReason.trim()) {
      showToast("error", "Please provide a reason for reporting.");

      return;
    }

    try {
      await axios.post(
        "https://back.ikoyiproperty.com:8443/report-news",
        {
          id: id,
          title: title,
          reason: reportReason,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setReportReason("");
      setIsReportModalVisible(false);
      showToast("success", "Report sent successfully.");
    } catch (error) {
      console.error("Error sending report:", error);
      setReportReason("");
      setIsReportModalVisible(false);
      showToast("error", "Failed to send report.");
    }
  };

  // Fetch comments for the post
  const fetchComments = async () => {
    const token = await AsyncStorage.getItem("userToken");
    const URL = `https://africanawa.com/wp-json/wp/v2/comments?post=${id}`;

    const headers = token ? { Authorization: `Bearer ${token}` } : {}; // Use header only if token exists

    try {
      const response = await axios.get(URL, { headers });
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error.response || error);
    }
  };

  // Post a new comment to WordPress
  const postComment = async () => {
    if (!newComment.trim()) {
      showToast("error", "Comment content is required.");
      return;
    }

    try {
      setIsPosting(true);
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        showToast("error", "You must be logged in to post a comment.");

        setIsPosting(false);
        return;
      }

      const response = await fetch(
        `https://africanawa.com/wp-json/wp/v2/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            post: id,
            author_name: userName,
            author_email: userEmail,
            content: newComment,
          }),
        }
      );

      if (response.ok) {
        const commentData = await response.json();
        setComments((prevComments) => [commentData, ...prevComments]);
        setNewComment("");
        showToast("success", "Comment posted successfully.");
      } else {
        const error = await response.json();
        Alert.alert("Error", error.message || "Failed to post the comment");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      Alert.alert("Error", "Something went wrong!");
    } finally {
      setIsPosting(false);
    }
  };

  // Render each comment
  const renderComment = ({ item }) => (
    <View style={styles.comment}>
      <Text style={styles.commentAuthor}>{item.author_name}</Text>
      <Text style={styles.commentText}>
        {item.content.rendered.replace(/<\/?p>/g, "")} {/* Remove <p> tags */}
      </Text>
    </View>
  );
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const toggleBookmark = async (postId: string) => {
    try {
      const storedBookmarks = await AsyncStorage.getItem("bookmarks");
      let updatedBookmarks = storedBookmarks ? JSON.parse(storedBookmarks) : [];

      const postIdStr = postId.toString();

      if (updatedBookmarks.includes(postIdStr)) {
        updatedBookmarks = updatedBookmarks.filter((id) => id !== postIdStr);
      } else {
        updatedBookmarks = [...updatedBookmarks, postIdStr];
      }

      await AsyncStorage.setItem("bookmarks", JSON.stringify(updatedBookmarks));
      setBookmarkedNews(updatedBookmarks); // Update the state
      return updatedBookmarks;
    } catch (error) {
      console.error("Error updating bookmarks:", error);
      throw error;
    }
  };

  const renderRelatedNewsItem = ({ item }) => (
    <TouchableOpacity
      style={styles.relatedNewsItem}
      onPress={() =>
        navigation.replace("NewsDetail", {
          id: item.id,
          title: he.decode(item.title?.rendered || ""),
          authorName: item._embedded?.author?.[0]?.name,
          authorImageUrl:
            item._embedded?.author?.[0]?.avatar_urls?.["96"] ||
            Image.resolveAssetSource(logo).uri,
          date: item.date,
          content: item.content?.rendered,
          imageUrl:
            item.jetpack_featured_media_url ||
            item.featured_image_url ||
            item._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
            "https://via.placeholder.com/150",
        })
      }
    >
      <Image
        source={{
          uri:
            item.jetpack_featured_media_url ||
            item.featured_image_url ||
            item._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
            "https://via.placeholder.com/150",
        }}
        style={styles.relatedNewsImage}
      />
      <Text style={styles.relatedNewsTitle}>
        {he.decode(item.title?.rendered || "")}
      </Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* News Image */}
          <Image source={{ uri: imageUrl }} style={styles.image} />

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Author Info and Date */}
          <View style={styles.authorRow}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Image
                source={{ uri: authorImageUrl }}
                style={styles.authorImage}
              />
              <View>
                <Text style={styles.authorName}>{authorName}</Text>
                <Text style={styles.date}>{formatDate(date)}</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 30 }}>
              <TouchableOpacity onPress={() => setIsReportModalVisible(true)}>
                <View
                  style={{
                    width: 40, // Circle size
                    height: 40, // Circle size
                    borderRadius: 20, // Half of width/height for a perfect circle
                    backgroundColor: "#f0e6e1", // Optional background color
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 2, // Border thickness
                    borderColor: "#4c270a", // Border color
                  }}
                >
                  <FontAwesome
                    name="exclamation-triangle"
                    size={24}
                    color="#4c270a"
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={async () => {
                  try {
                    const updatedBookmarks = await toggleBookmark(id);
                    setBookmarkedNews(updatedBookmarks);
                  } catch (error) {
                    console.error("Error toggling bookmark:", error);
                  }
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: bookmarkedNews.includes(id.toString())
                      ? "#f0e6e1" // Dark background when bookmarked
                      : "#f0e6e1", // Light background when not
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 2,
                    borderColor: "#4c270a",
                  }}
                >
                  <FontAwesome
                    name={
                      bookmarkedNews.includes(id.toString())
                        ? "bookmark" // Solid icon when bookmarked
                        : "bookmark-o" // Outlined icon when not
                    }
                    size={24}
                    color={
                      bookmarkedNews.includes(id.toString())
                        ? "#4c270a" // White icon when bookmarked (on dark background)
                        : "#4c270a" // Dark icon when not (on light background)
                    }
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Render HTML Content */}
          <RenderHtml contentWidth={width} source={{ html: content }} />

          {/* Comments Section */}
          <Text style={styles.commentsHeader}>Comments</Text>
          {comments && comments.length > 0 ? (
            <FlatList
              data={comments}
              renderItem={renderComment}
              keyExtractor={(item) => item.id.toString()}
              keyboardShouldPersistTaps="handled"
            />
          ) : (
            <Text>No comments yet.</Text>
          )}

          {/* Add New Comment Section */}
          <Text style={styles.commentsHeader}>Post a Comment</Text>
          <View style={styles.addCommentSection}>
            <TextInput
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Add a comment..."
              style={styles.commentInput}
            />
            <StyledButton
              title="Post"
              onPress={postComment}
              disabled={!token || isPosting}
            />
          </View>

          {/* Related News Section */}
          <Text style={styles.sectionHeader}>Related News</Text>
          {isLoadingRelated ? (
            <ActivityIndicator size="small" color="#0000ff" />
          ) : relatedNews.length > 0 ? (
            <FlatList
              data={relatedNews}
              renderItem={renderRelatedNewsItem}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedNewsContainer}
            />
          ) : (
            <Text style={styles.noRelatedNews}>No related news found.</Text>
          )}
        </ScrollView>

        {isReportModalVisible && (
          <Modal
            transparent
            animationType="slide"
            visible={isReportModalVisible}
            onRequestClose={() => setIsReportModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Report Post</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter reason for reporting"
                  value={reportReason}
                  onChangeText={setReportReason}
                />
                <View style={styles.modalButtons}>
                  <StyledButton
                    disabled={false}
                    title="Submit"
                    onPress={handleReport}
                  />
                  <StyledButton
                    disabled={false}
                    title="Cancel"
                    onPress={() => setIsReportModalVisible(false)}
                  />
                </View>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </KeyboardAvoidingView>
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
    flexGrow: 1,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
    color: "#333",
  },
  authorRow: {
    flexDirection: "row",
    marginBottom: 10,
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
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
  commentsHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  comment: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  commentAuthor: {
    fontWeight: "bold",
  },
  commentText: {
    marginTop: 5,
  },
  addCommentSection: {
    marginTop: 20,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },

  // ... your existing styles ...

  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 15,
    color: "#4c270a",
  },
  relatedNewsContainer: {
    paddingBottom: 15,
  },
  relatedNewsItem: {
    width: 200,
    marginRight: 15,
  },
  relatedNewsImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  relatedNewsTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  noRelatedNews: {
    textAlign: "center",
    marginVertical: 20,
    color: "#666",
  },
});
