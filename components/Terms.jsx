import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
import { CheckBox } from "react-native-elements"; // Install: npm install react-native-elements

const TermsOfService = ({ navigation }) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleAccept = () => {
    if (!isChecked) {
      Alert.alert("Agreement Required", "Please accept the terms to proceed.");
      return;
    }
    // Save user's acceptance status (e.g., AsyncStorage or backend)
    navigation.replace("Tabs"); // Navigate to the main screen
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Terms of Service</Text>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.termsText}>
          Welcome to Africanawa! By using this app, you agree to the following
          terms:
          {"\n\n"}
          1. **No Objectionable Content**: You must not post or share any
          content that is offensive, hateful, harassing, or illegal.
          {"\n\n"}
          2. **User Responsibility**: You are responsible for all content you
          upload or share.
          {"\n\n"}
          3. **Content Moderation**: We reserve the right to remove content that
          violates these terms.
          {"\n\n"}
          4. **Blocking and Reporting**: Users can block or report content and
          other users for violating these terms.
          {"\n\n"}
          5. **Account Termination**: Violation of these terms may result in the
          suspension or termination of your account.
          {"\n\n"}
          By using Africanawa, you agree to abide by these rules. Thank you for
          keeping our community safe and respectful!
        </Text>
      </ScrollView>

      <View style={styles.checkboxContainer}>
        <CheckBox
          title="I agree to the Terms of Service"
          checked={isChecked}
          onPress={() => setIsChecked(!isChecked)}
          containerStyle={styles.checkbox}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleAccept}>
        <Text style={styles.buttonText}>Accept and Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  termsText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  checkboxContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  button: {
    backgroundColor: "#4c270a",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default TermsOfService;
