import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Alert, BackHandler, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useMusic } from "../context/MusicContext";



const emojiHeaders = {
  "💖": "Fav Love Song",
  "😜": "Fav Item Song",
  "😘": "Fav Romantic Song",
  "🔥": "Fav Mass Song",
  "😔": "Fav Sad Song",
  "🥵": "Fav Elevation Song",
  "∞": "Looped Song",
};

export default function EmojiPlayerScreen({ route, navigation }) {
  const { song, emoji } = route.params || {};
  const { selectSongFromFolder, currentSong,setCurrentSong, stop } = useMusic();
// 🔥 FIRST EFFECT — Start playing the song
useEffect(() => {
  if (!song) {
    stop && stop();
    Alert.alert(
      "No Song Found",
      "This emoji has no song assigned yet.",
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
    return;
  }

  selectSongFromFolder([song], song); // play
}, [song]);

useEffect(() => {
  const backAction = () => {
    stop();
    setCurrentSong(null);

    navigation.goBack(); // manually go back

    return true; // prevent default behavior
  };

  const sub = BackHandler.addEventListener(
    "hardwareBackPress",
    backAction
  );

  return () => sub.remove();
}, []);



// 🔥 SECOND EFFECT — Attach finish listener ONLY when sound is ready
useEffect(() => {
  if (!currentSong?.sound) return;

  const sound = currentSong.sound;

  const unsubscribe = sound.setOnPlaybackStatusUpdate((status) => {
    if (status.didJustFinish) {
      stop();
      setCurrentSong(null);
      navigation.goBack();
    }
  });

  return () => unsubscribe && unsubscribe();
}, [currentSong?.sound]);  


  const headerTitle = emojiHeaders[emoji] || "Song";

  return (
    <View style={styles.container}>

      {/* TOP HEADER */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() =>{navigation.goBack();
             stop();
             setCurrentSong(null);
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerText}>{headerTitle}</Text>
      </View>

      {/* CENTER EMOJI */}
      <View style={styles.centerBox}>
        <Text style={styles.centerText}>{emoji}</Text>
      </View>
      <View style={{flexDirection:"row",justifyContent:"center"}}>
        <Ionicons name="musical-notes" size={26} color="#00AEEF"style={{ marginRight: 10 }} />
        <Text style={{color:"#fff",textAlign:"center",paddingBottom:280,fontSize:25}}>{song.name.replace(/\.(mp3|wav|m4a|aac|flac|ogg)$/i, "")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 10,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#0af",
  },

  backButton: { marginRight: 10 },

  headerText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "600",
  },

  centerBox: {
    flex: 1,
    paddingTop: 90,
    alignItems: "center",
  },

  centerText: {
    fontSize: 350,
    color: "#fff",
  },
});
