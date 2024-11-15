// KeyboardAvoidingWrapper.js

import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const KeyboardAvoidingWrapper = ({ children }) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {children}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default KeyboardAvoidingWrapper;
