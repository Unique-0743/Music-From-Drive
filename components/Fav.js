import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

export default function Fav({ onSelect }) {
  const navigation = useNavigation();
  const STORAGE_KEY = "favEmojiMap";

  const row1 = ["💖", "😜", "😘", "🔥"];
  const row2 = ["😔", "🥵", "∞"];

  const [emojiMap, setEmojiMap] = useState({});
  const [mapLoaded, setMapLoaded] = useState(false);
   //storing emoji x song data...
  useEffect(() => {
    const loadMap = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setEmojiMap(JSON.parse(saved));
      } catch (e) {
        console.log("Failed to load emoji map:", e);
      } finally {
        setMapLoaded(true);
      }
    };
    loadMap();
  }, []);
  



  // tap on emoji to play the song
  const handleEmojiPress = (emoji) => {
  if (!mapLoaded) return;

  const songObj = emojiMap[emoji]; 

  if (!songObj) {
    Alert.alert(
      "No song assigned",
      "Long press a song, then long press an emoji to assign."
    );
    return;
  }

  navigation.navigate("EmojiPlayerScreen", {
    song: songObj,
    emoji: emoji,
  });
};


  
  const handleEmojiLongPress = (emoji) => {
    if (onSelect) onSelect(emoji);
  };

  const renderRow = (row) =>
    row.map((emoji, idx) => (
      <TouchableOpacity
        key={idx}
        style={{ marginHorizontal: 5 }}
        onPress={() => handleEmojiPress(emoji)}
        onLongPress={() => handleEmojiLongPress(emoji)}
      >
        <Text style={{ fontSize: 28 }}>{emoji}</Text>
      </TouchableOpacity>
    ));

  return (
    <View style={{ width: "100%", paddingTop: 5 }}>
     <Text
  style={{
    color: "#000",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    marginTop: -15,
    marginLeft: -7,
  }}
>
  #F
  <Text style={{ fontSize: 12 }}>💙</Text>
  <Text style={{ fontSize: 24 }}>v</Text>
  7even
</Text>


      <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 6 }}>
        {renderRow(row1)}
      </View>

      <View style={{ flexDirection: "row", justifyContent: "center" }}>{renderRow(row2)}</View>
    </View>
  );
}
