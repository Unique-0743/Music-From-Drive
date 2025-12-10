// Emoji Assign Bar UI...

import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const EMOJIS = ["💖", "😜", "😘", "🔥", "😔", "🥵", "∞"];

export default function EmojiAssignPopup({
  visible,
  position,
  onSelectEmoji,
  onClose,
}) {
  if (!visible) return null;

  return (
    <View
      style={[
        styles.popup,
        {
          top: position?.y ?? 100,
          left: position?.x ?? 100,
        },
      ]}
    >
      <View style={styles.row}>
        {EMOJIS.map((emoji, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => {
              onSelectEmoji(emoji); 
              onClose();
            }}
          >
            <Text style={styles.emoji}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  popup: {
    position: "absolute",
    backgroundColor: "white",
    borderRadius: 10,
    marginLeft:20,
    marginTop:4,
    paddingVertical: 8,
    paddingHorizontal: 8,
    width: 300,
    flexDirection: "row",
    justifyContent: "center",
    alignItems:"center",
    zIndex: 999,
    elevation: 10,
  },
  row: {
    flexDirection: "row",
  },
  emoji: {
    fontSize: 26,
    marginHorizontal: 6,
  },
});
