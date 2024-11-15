import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const StyledButton = ({ onPress, title, disabled }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, disabled && styles.disabledButton]}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#a80d0d", // Change this to your desired color
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#cccccc", // Color when the button is disabled
  },
});

export default StyledButton;
