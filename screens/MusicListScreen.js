import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmojiAssignPopup from "../components/EmojiAssignPopup"; //test
import { useMusic } from "../context/MusicContext";


export default function MusicListScreen({ route, navigation }) {
  // states
  const { currentSong, selectSongFromFolder } = useMusic();

  const [localSongs, setLocalSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resumeSong, setResumeSong] = useState(null);

  const flatListRef = useRef(null);

  const folderId = route?.params?.folderId || "";
  const title = route?.params?.title || "Songs";
const [popupVisible, setPopupVisible] = useState(false);
const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0, width: 0 });
const [emojiMap, setEmojiMap] = useState({});

const [popupSong, setPopupSong] = useState(null);



  useEffect(() => {
    fetchSongs();
  }, []);
  
// fetching songs from server...
  const fetchSongs = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `server link?folderId=${encodeURIComponent(folderId)}`
      );
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();

      const files = (data.files || []).map((item) => ({
        ...item,
        url: `Server Url ?fileId=${item.id}`,
      }));

      setLocalSongs(files);
     
    } catch (err) {
      console.error("Error fetching songs:", err);
    } finally {
      setLoading(false);
    }
  };
 
  // adding continue button... to continue playback from where i left...
const checkResume = async () => {
  try {
    const saved = await AsyncStorage.getItem(`resume_${folderId}`);
    if (!saved) {
      setResumeSong(null);
      return;
    }

    const data = JSON.parse(saved);
    if (!data?.songId) {
      setResumeSong(null);
      return;
    }

    const match = localSongs.find((s) => s.id === data.songId);

    if (match) {
      setResumeSong(match);  
      setResumeSong(null);
    }
  } catch (e) {
    console.log("Resume check error:", e);
  }
};

      useEffect(() => {
  if (!loading && localSongs.length > 0) {
    checkResume(); 
  }
}, [loading, localSongs.length]);

useEffect(() => {
  loadEmojiMap();
}, []);

const loadEmojiMap = async () => {
  try {
    const saved = await AsyncStorage.getItem("favEmojiMap");
    if (saved) {
      
      setEmojiMap(JSON.parse(saved));
    }
  } catch (e) {
    console.log("loadEmojiMap error:", e);
  }
};



  // Auto-scroll to selected song when list is present
  useEffect(() => {
   
    if (!currentSong || localSongs.length === 0) return;
    const index = localSongs.findIndex((s) => s.id === currentSong.id);
    if (index !== -1 && flatListRef.current) {
      
      setTimeout(() => {
        try {
          flatListRef.current.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.5,
          });
        } catch (_) {}
      }, 120);
    }
  }, [localSongs, currentSong]);

  

  

  const handleSelectSong = async (item) => {
  const folderQueue = localSongs.map((s) => ({
    ...s,
    url: s.url || `Server Url ?fileId=${s.id}`,
  }));

  // ✅ Save last played for this folder
  await AsyncStorage.setItem(
    `resume_${folderId}`,
    JSON.stringify({ songId: item.id })
  );

  // ✅ Play normally
  selectSongFromFolder(folderQueue, {
    ...item,
    url: item.url || `Server url?fileId=${item.id}`,// add your server url...
  });
};

const renderItem = ({ item }) => {
  let itemRef = { current: null };
  const isSelected = currentSong?.id === item.id;
  const displayName = item.name.replace(/\.(mp3|wav|m4a|aac|flac|ogg)$/i, "");

  // ✅ Find emoji assigned to this song
 const assignedEmoji = Object.keys(emojiMap).find((emo) => {
  const s = emojiMap[emo];
  return s && s.id === item.id;
});



  return (
    <View ref={(ref) => (itemRef.current = ref)} style={{ position: "relative" }}>
      <TouchableOpacity
        style={[styles.itemContainer, { borderColor: isSelected ? "#E8AC41" : "#00AEEF" }]}
        onPress={() => handleSelectSong(item)}
        onLongPress={() => {
          itemRef.current.measure((x, y, width, height) => {
            setPopupPosition({ x, y: 0, width });
            setPopupSong(item);
            setPopupVisible(true);
          });
        }}
        delayLongPress={300}
      >
        <View style={styles.itemLeft}>
          <Ionicons name="musical-notes" size={26} color={isSelected ? "#E8AC41" : "#00AEEF"} style={{ marginRight: 10 }} />
          <Text style={styles.itemText} numberOfLines={1}>{displayName}</Text>
        </View>

       {assignedEmoji && (
  <Text style={{ fontSize: 22, position: "absolute", right: 15, top: 12 }}>
    {assignedEmoji}
  </Text>
)}

      </TouchableOpacity>

      {popupVisible && popupSong?.id === item.id && (
        <EmojiAssignPopup
          visible={popupVisible}
          position={popupPosition}
          onSelectEmoji={(emoji) => handleAssignEmoji(emoji, item)}
          onClose={() => setPopupVisible(false)}
        />
      )}
    </View>
  );
};






const handleAssignEmoji = async (emoji, song) => {
  try {
    
    const updated = { ...(emojiMap || {}) };

    
    Object.keys(updated).forEach((e) => {
      if (updated[e]?.id === song.id) {
        delete updated[e];
      }
      
    });

   
    updated[emoji] = {
      id: song.id,
      name: song.name,
      url: song.url || `server Url ?fileId=${song.id}`,
      
    };

    setEmojiMap(updated);
    await AsyncStorage.setItem("favEmojiMap", JSON.stringify(updated));
  } catch (e) {
    console.log("handleAssignEmoji error:", e);
  }
};


 
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{title}</Text>
        {resumeSong && (
  <TouchableOpacity
    onPress={() => handleSelectSong(resumeSong)}
    style={{
      paddingHorizontal: 5,
      paddingVertical: 6,
      backgroundColor: "#0af",
      borderRadius: 5,
      position: "absolute",
      right: 10,
      top: 10,
      zIndex: 999,
    }}
  >
    <Text style={{ color: "#fff", fontWeight: "bold" }}>Continue</Text>
  </TouchableOpacity>
)}

      </View>

      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#00aaff" />
          </View>
        ) : localSongs.length === 0 ? (
          <View style={styles.noSongs}>
            <Text style={styles.noSongsText}>No songs found</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={localSongs}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 12, paddingBottom: 140 }}
            style={{ width: "100%" }}
            getItemLayout={(data, index) => ({ length: 70, offset: 70 * index, index })}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            showsVerticalScrollIndicator={false}

            windowSize={5}
          />
        )}
      
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#3b3b3b" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#00aaff",
    backgroundColor: "#111",
  },
  backButton: { marginRight: 10 },
  headerText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#111" },
  noSongs: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 50 },
  noSongsText: { color: "#fff", fontSize: 16 },
  itemContainer: { borderWidth: 2, borderRadius: 10, padding: 12, marginBottom: 10, width: "100%", backgroundColor: "#222" },
  itemLeft: { flexDirection: "row", alignItems: "center" },
  itemText: { color: "#fff", flexShrink: 1 },
});
