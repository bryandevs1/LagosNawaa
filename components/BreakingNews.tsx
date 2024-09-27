import { View, Text, StyleSheet, FlatList, ViewToken } from "react-native";
import React, { useRef, useState } from "react";
import { NewsDataType } from "../types";
import SliderItem from "./SliderItem";
import Animated, {
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import Pagination from "./Pagination";

type Props = {
  newsList: Array<NewsDataType>;
};

const BreakingNews = ({ newsList }: Props) => {
  // Define all hooks outside any conditions
  if (newsList.length === 0) {
    return null; // This is causing an early return if no items are available
  }

  const [data, setData] = useState(newsList); // Initialize state with newsList
  const [paginationIndex, setPaginationIndex] = useState(0);
  const scrollX = useSharedValue(0);

  // Ensure `onViewableItemsChanged` is defined outside the condition
  const onViewableItemsChanged = ({
    viewableItems,
  }: {
    viewableItems: ViewToken[];
  }) => {
    if (
      viewableItems[0].index !== undefined &&
      viewableItems[0].index !== null
    ) {
      console.log("Viewable items changed: ", viewableItems);
      setPaginationIndex(viewableItems[0].index % newsList.length);
    }
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged },
  ]);

  const onScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  // Function to load more data (dummy implementation for example)
  const loadMoreData = () => {
    const moreData = [...newsList]; // Here you would load new data, but for now, we're reusing the same data
    setData((prevData) => [...prevData, ...moreData]); // Append new data to the existing data
  };

  // Now, the condition for early return can be applied after the hooks are defined
  if (newsList.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text
        style={{
          marginBottom: 0,
          padding: 20,
          fontSize: 22,
          fontWeight: "800",
        }}
      >
        Breaking News
      </Text>
      <View style={styles.slideWrapper}>
        <Animated.FlatList
          data={data} // Use `data` state instead of `newsList` directly
          keyExtractor={(_, index) => `list_items${index}`}
          renderItem={({ item, index }) => (
            <SliderItem slideItem={item} index={index} scrollX={scrollX} />
          )}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScrollHandler}
          scrollEventThrottle={16}
          onEndReached={loadMoreData} // Call load more data on end reached
          onEndReachedThreshold={0.5} // Threshold for triggering loadMoreData
          viewabilityConfigCallbackPairs={
            viewabilityConfigCallbackPairs.current
          }
        />
        <Pagination
          items={newsList}
          scrollX={scrollX}
          paginationIndex={paginationIndex}
        />
      </View>
    </View>
  );
};

export default BreakingNews;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
  slideWrapper: {},
});
