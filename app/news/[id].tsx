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
} from "react-native";
import { useRoute } from "@react-navigation/native";
import RenderHtml from "react-native-render-html";
import { Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import StyledButton from "../../components/StyledButton";
import KeyboardAvoidingWrapper from "../../components/KeyboardAvoidingView";
import immagee from "./icon.png";
import { FontAwesome } from "@expo/vector-icons";
import axios from "axios";

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

  // Fetch user data from AsyncStorage and comments when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      const storedName = await AsyncStorage.getItem("userName");
      const storedEmail = await AsyncStorage.getItem("userEmail");
      if (storedName && storedEmail) {
        setUserName(storedName);
        setUserEmail(storedEmail);
      }
    };

    fetchUserData();
    fetchComments(); // Fetch comments for the post
  }, []);

  const handleReport = async () => {
    if (!reportReason.trim()) {
      Alert.alert("Error", "Please provide a reason for reporting.");
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

      Alert.alert("Success", "Report sent successfully.");
      setReportReason("");
      setIsReportModalVisible(false);
    } catch (error) {
      console.error("Error sending report:", error);
      Alert.alert("Error", "Failed to send report.");
    }
  };

  // Fetch comments for the post
  const fetchComments = async () => {
    const token = await AsyncStorage.getItem("userToken");
    try {
      const response = await fetch(
        `https://lagosnawa.com/wp-json/wp/v2/comments?post=${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setComments(data);
      } else {
        console.error("Error fetching comments:", data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  // Post a new comment to WordPress
  const postComment = async () => {
    if (!newComment.trim()) {
      Alert.alert("Error", "Comment content is required!");
      return;
    }

    try {
      setIsPosting(true);
      const token = await AsyncStorage.getItem("userToken");

      const response = await fetch(
        `https://lagosnawa.com/wp-json/wp/v2/comments`,
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
        Alert.alert("Success", "Comment posted successfully");
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

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* News Image */}
        <Image source={{ uri: imageUrl }} style={styles.image} />

        {/* Title */}
        <Text style={styles.title}>{title}</Text>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Author Info and Date */}
          <View style={styles.authorRow}>
            <Image source={immagee} style={styles.authorImage} />
            <View>
              <Text style={styles.authorName}>Lagosnawa</Text>
              <Text style={styles.date}>{formatDate(date)}</Text>
            </View>
          </View>
          {/* Author Name on the Far Right */}
          <Text style={[styles.authorName, { marginLeft: "auto" }]}>
            <TouchableOpacity onPress={() => setIsReportModalVisible(true)}>
              <FontAwesome
                name="exclamation-triangle"
                size={24}
                color="#a80d0d"
              />
            </TouchableOpacity>
          </Text>
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
            disabled={isPosting}
          />
        </View>
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
    alignItems: "center",
    marginBottom: 10,
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
});
