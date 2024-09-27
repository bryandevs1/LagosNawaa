import { View, Text, StyleSheet } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";

type Props = {
  onCategoryChanged: (categoryId: number) => void; // Updated to pass category ID
};

const Categories = ({ onCategoryChanged }: Props) => {
  const scrollRef = useRef<ScrollView>(null);
  const itemRef = useRef<(View | null)[]>([]); // Use View for refs to ensure measure works
  const [activeIndex, setActiveIndex] = useState(0); // State to track the active category index
  const [categories, setCategories] = useState<any[]>([]); // Store categories

  const getCategories = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        console.log("No token found, please log in.");
        return;
      }

      const URL = "https://lagosnawa.com/wp-json/wp/v2/categories?per_page=100";

      const response = await axios.get(URL, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the request header
        },
      });

      if (response && response.data) {
        setCategories([{ id: 0, name: "All", slug: "all" }, ...response.data]); // Add "All" option at the beginning
      }
    } catch (err: any) {
      console.log("Error Message: ", err.message);
    }
  };

  // Fetch categories when component mounts
  useEffect(() => {
    getCategories();
  }, []);

  const handleSelectCategory = (index: number) => {
    const selectedCategory = categories[index];

    if (selectedCategory) {
      // Scroll to selected category
      const selected = itemRef.current[index];
      if (selected) {
        selected.measure((x) => {
          scrollRef.current?.scrollTo({ x: x - 5, y: 0, animated: true });
        });
      }

      setActiveIndex(index); // Update the active index
      onCategoryChanged(selectedCategory.id); // Pass the category ID, not slug
    }
  };

  return (
    <View style={{ marginTop: 30 }}>
      <Text style={styles.text}>Trending Right Now</Text>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.itemWrapper}
      >
        {categories.length > 0 ? (
          categories.map((category, index) => (
            <View
              ref={(el) => (itemRef.current[index] = el)} // Assign ref correctly
              key={category.id}
              style={[
                styles.item,
                activeIndex === index && styles.itemActive, // Highlight active category
              ]}
            >
              <TouchableOpacity onPress={() => handleSelectCategory(index)}>
                <Text style={styles.categoryItem}>{category.name}</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text>Loading categories...</Text>
        )}
      </ScrollView>
    </View>
  );
};

export default Categories;

const styles = StyleSheet.create({
  text: {
    fontSize: 22,
    fontWeight: "600",
    color: "black",
    marginLeft: 20,
    marginBottom: 10,
  },
  categoryItem: {
    fontSize: 14,
    color: "gray",
    letterSpacing: 0.5,
  },
  itemWrapper: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  item: {
    borderWidth: 1,
    borderColor: "lightgray",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  itemActive: {
    backgroundColor: "lightgray",
    borderColor: "gray",
    borderWidth: 2,
  },
});
