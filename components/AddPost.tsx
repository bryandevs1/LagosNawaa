import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingViewComponent,
  KeyboardAvoidingView,
  Platform, // For custom button style
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as MailComposer from "expo-mail-composer";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message"; // Import Toast
import RNPickerSelect from "react-native-picker-select"; // Import the picker component
import { MaterialIcons } from "@expo/vector-icons"; // Import icons
import { useNavigation } from "@react-navigation/native"; // Import navigation hook
import { Picker } from "@react-native-picker/picker";

const AddPostScreen = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const response = await axios.get(
          "https://africanawa.com/wp-json/wp/v2/categories?per_page=100",
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        setCategories(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setLoading(false);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to load categories",
        });
      }
    };

    fetchCategories();
  }, []);

  // Image picker function
  const pickImage = async () => {
    try {
      // First request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Permission denied",
          text2: "Sorry, we need camera roll permissions to select images",
        });
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri); // Use the first selected image
        console.log("Selected image URI:", result.assets[0].uri); // Debug log
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to select image",
      });
    }
  };
  // Upload image to WordPress
  const uploadImage = async (uri) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error("No authentication token");

      const formData = new FormData();
      formData.append("file", {
        uri,
        name: `upload_${Date.now()}.jpg`,
        type: "image/jpeg",
      });

      const response = await axios.post(
        "https://africanawa.com/wp-json/wp/v2/media",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.id; // Return media ID
    } catch (error) {
      console.error("Image upload failed:", error);
      throw error;
    }
  };

  // Submit post directly to WordPress
  const submitPost = async () => {
    if (!title || !content || !category) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Title, content and category are required",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error("Authentication required");

      // Find category ID
      const selectedCategory = categories.find((cat) => cat.name === category);
      if (!selectedCategory) throw new Error("Invalid category selected");

      // Process tags
      let tagIds = [];
      if (tags) {
        // Split tags by comma and trim whitespace
        const tagNames = tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag);

        // Get or create tags and collect their IDs
        for (const tagName of tagNames) {
          const tagId = await getOrCreateTag(tagName, token);
          if (tagId) tagIds.push(tagId);
        }
      }

      // Prepare post data
      const postData = {
        title,
        content,
        status: "draft",
        categories: [selectedCategory.id],
        tags: tagIds, // Use the array of tag IDs
      };

      // Upload image if selected
      if (image) {
        const mediaId = await uploadImage(image);
        postData.featured_media = mediaId;
      }

      // Submit post
      const response = await axios.post(
        "https://africanawa.com/wp-json/wp/v2/posts",
        postData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Post submitted successfully!",
      });

      // Reset form
      setTitle("");
      setContent("");
      setCategory("");
      setTags("");
      setImage(null);

      // Navigate back after successful submission
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error) {
      console.error("Post submission failed:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.message || "Failed to submit post",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOrCreateTag = async (tagName, token) => {
    try {
      // First try to find existing tag
      const searchResponse = await axios.get(
        `https://africanawa.com/wp-json/wp/v2/tags?search=${encodeURIComponent(
          tagName
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // If tag exists, return its ID
      if (searchResponse.data && searchResponse.data.length > 0) {
        return searchResponse.data[0].id;
      }

      // If tag doesn't exist, create it
      const createResponse = await axios.post(
        "https://africanawa.com/wp-json/wp/v2/tags",
        {
          name: tagName,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return createResponse.data.id;
    } catch (error) {
      console.error("Error processing tag:", tagName, error);
      return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="close" size={30} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create New Post</Text>
          <View style={{ width: 30 }} /> {/* Spacer for alignment */}
        </View>

        <Text style={styles.label}>Title*</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter post title"
        />

        <Text style={styles.label}>Content*</Text>
        <TextInput
          style={[styles.input, styles.contentInput]}
          value={content}
          onChangeText={setContent}
          placeholder="Enter post content"
          multiline
          numberOfLines={6}
        />

        <Text style={styles.label}>Category*</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : (
          <Picker
            selectedValue={category}
            onValueChange={setCategory}
            style={{
              width: "100%",
              color: "#333", // Text color
              fontSize: 16, // Text size
              fontWeight: "bold",
              backgroundColor: "#f5f5f5", // Background color
              borderRadius: 10,
            }}
            itemStyle={{
              fontSize: 18, // Font size inside the dropdown
              fontWeight: "600",
              color: "#222", // Text color inside dropdown
            }}
          >
            <Picker.Item label="Select a category" value="" />
            {categories.map((cat) => (
              <Picker.Item key={cat.id} label={cat.name} value={cat.name} />
            ))}
          </Picker>
        )}

        <Text style={styles.label}>Tags</Text>
        <TextInput
          style={styles.input}
          value={tags}
          onChangeText={setTags}
          placeholder="Comma separated tags (e.g., news, lagos, events)"
        />

        <Text style={styles.label}>Featured Image</Text>
        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.imageButtonText}>
            {image ? "Change Image" : "Select Image"}
          </Text>
        </TouchableOpacity>

        {image && (
          <Image
            source={{ uri: image }}
            style={styles.previewImage}
            resizeMode="cover"
          />
        )}

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.disabledButton]}
          onPress={submitPost}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Post</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  contentInput: {
    height: 150,
    textAlignVertical: "top",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 10,
  },
  imageButton: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  imageButtonText: {
    fontSize: 16,
    color: "#333",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: "#4c270a",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default AddPostScreen;
