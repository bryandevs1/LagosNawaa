import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity, // For custom button style
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as MailComposer from "expo-mail-composer";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message"; // Import Toast
import RNPickerSelect from "react-native-picker-select"; // Import the picker component
import { MaterialIcons } from "@expo/vector-icons"; // Import icons
import { useNavigation } from "@react-navigation/native"; // Import navigation hook

const AddPostScreen = () => {
  const navigation = useNavigation(); // Get navigation object
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(""); // Selected category
  const [categories, setCategories] = useState([]); // List of categories from API
  const [tag, setTag] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true); // For showing loading spinner during fetch

  // Fetch categories from the WordPress site with Bearer token authorization
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`, // Add Bearer token to headers
          },
        };

        const response = await axios.get(
          "https://lagosnawa.com/wp-json/wp/v2/categories?per_page=100",
          config
        );
        const categoryOptions = response.data.map((cat) => ({
          label: cat.name,
          value: cat.name,
        }));

        setCategories(categoryOptions); // Store fetched categories
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        setLoading(false); // Stop loading on error
        Toast.show({
          type: "error",
          text1: "Error fetching categories",
          text2: "Please try again later.",
        });
      }
    };

    fetchCategories();
  }, []);

  // Function to pick an image
  const pickImage = async () => {
    const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (result.granted) {
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        base64: false, // Ensure base64 is disabled if you want to use URI
      });

      if (!pickerResult.cancelled) {
        setImage(pickerResult.uri); // Store the URI of the selected image
      }
    } else {
      Toast.show({
        type: "error",
        text1: "Permission denied",
        text2: "You need to enable permissions to use this feature.",
      });
    }
  };

  // Function to handle the submission of data via email
  const handleSubmit = async () => {
    if (!title || !content || !category || !tag) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please fill in all fields.",
      });
      return;
    }

    const message = `
      Title: ${title}
      Content: ${content}
      Category: ${category}
      Tag: ${tag}
      Image: ${image ? image : "No image selected"}
    `;

    const options = {
      recipients: ["bryanojji@outlook.com"], // Replace with the email address
      subject: `New Post Submission: ${title}`,
      body: message,
      attachments: image ? [image] : [], // Attach the image URI
    };

    try {
      const emailResult = await MailComposer.composeAsync(options);
      if (emailResult.status === "sent") {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Post information has been sent via email!",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Email was not sent.",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error sending email",
        text2: "Please try again later.",
      });
    }
  };

  // Function to handle closing the screen
  const handleClose = () => {
    navigation.goBack(); // Navigate back to the previous screen
  };  

  return (
    <View style={styles.modalContainer}>
      {/* Circular X Button */}
      <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
        <MaterialIcons name="close" size={30} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter post title"
      />
      <Text style={styles.label}>Content</Text>
      <TextInput
        style={styles.textArea}
        value={content}
        onChangeText={setContent}
        placeholder="Enter post content"
        multiline={true}
      />

      <Text style={styles.label}>Category</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" /> // Show spinner while loading categories
      ) : (
        <RNPickerSelect
          onValueChange={(value) => setCategory(value)}
          items={categories}
          style={pickerSelectStyles}
          placeholder={{ label: "Select a category", value: null }}
        />
      )}

      <Text style={styles.label}>Tag</Text>
      <TextInput
        style={styles.input}
        value={tag}
        onChangeText={setTag}
        placeholder="Enter post tags"
      />

      <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
        <Text style={styles.imagePickerText}>
          {image ? "Change Image" : "Pick an Image"}
        </Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image }} style={styles.image} />}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit Post</Text>
      </TouchableOpacity>

      {/* Toast Component */}
      <Toast />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  modalContainer: {
    position: "absolute",
    bottom: 0,
    height: "95%", // Make the modal cover 95% of the screen
    width: "100%",
    backgroundColor: "#fff", // Set background to white
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 70,
    padding: 20,
    elevation: 10, // Add shadow for Android
    shadowColor: "#000", // Add shadow for iOS
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#a80d0d", // Customize the color as needed
    justifyContent: "center",
    alignItems: "center",
    elevation: 3, // Add shadow for Android
    shadowColor: "#000", // Add shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    // Add blurred background
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    // Adjust blur radius as needed
    filter: "blur(2px)",
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "600",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff", // White background
    padding: 15,
    borderRadius: 10, // Rounded corners
    marginBottom: 20,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    height: 120,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#a80d0d",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  container: {
    flex: 1,
    paddingTop: 100,
    padding: 20,
    backgroundColor: "#f7f7f7", // Light background
  },
  imagePickerButton: {
    backgroundColor: "#ececec", // Grey background for image picker
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  imagePickerText: {
    color: "#555", // Grey text
    fontSize: 16,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10, // Rounded corners for image
    marginBottom: 20,
  },
});

// Picker styles
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    color: "black",
    paddingRight: 30, // To ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    color: "black",
    paddingRight: 30, // To ensure the text is never behind the icon
  },
});

export default AddPostScreen;
