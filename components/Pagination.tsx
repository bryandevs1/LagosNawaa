import { View, Text, Animated, StyleSheet } from "react-native";
import React from "react";
import { NewsDataType } from "../types";
import { SharedValue } from "react-native-reanimated";

type Props = {
  items: NewsDataType[];
  paginationIndex: number;
  height: number;
  scrollX: SharedValue<number>;
};

const Pagination = ({ items, paginationIndex, scrollX }: Props) => {
  return (
    <View style={styles.container}>
      {items.map((_, index) => (
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: paginationIndex === index ? "#808080" : "#000" },
          ]}
          key={index}
        >
          {/* You can animate this dot using scrollX or paginationIndex */}
        </Animated.View>
      ))}
    </View>
  );
};

export default Pagination;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    position: "absolute",
    bottom: -20,
    alignSelf: "center",
  },
  dot: {
    width: 7, // Adjust size for pagination dot
    height: 7,
    borderRadius: 5,
    backgroundColor: "#888", // Placeholder color for dots
    marginHorizontal: 2, // Adjust spacing between dots
  },
});
