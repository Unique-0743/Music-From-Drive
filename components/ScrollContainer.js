
import { ScrollView, StyleSheet } from "react-native";

export default function ScrollContainer({ children, contentContainerStyle }) {
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    width: "100%",
    backgroundColor: "#000",
  },
  content: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "flex-start",
  },
});
