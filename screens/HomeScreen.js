
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Rect } from "react-native-svg";
import PopupMenu from "../components/PopUpMenu";
import ScrollContainer from "../components/ScrollContainer";
import StyledAlert from "../components/StyledAlert";
import WeeklyBarChart from "../components/WeeklyBarChart";
import { useMusic } from "../context/MusicContext";
const { width } = Dimensions.get("window");
const CARD_MARGIN = 12;
const CARD_WIDTH = width - CARD_MARGIN * 5; 

const genres = [
  { id: "1", title: "Item", image: require("../assets/item.jpg"), folderId: "Keep your Google Drive Folder id" },
  { id: "2", title: "Romantic", image: require("../assets/romantic.jpg"), folderId: "Keep your Google Drive Folder id" },
  { id: "3", title: "Mass", image: require("../assets/mass.jpg"), folderId: "Keep your Google Drive Folder id" },
  { id: "4", title: "Sad", image: require("../assets/sad.jpg"), folderId: "Keep your Google Drive Folder id" },
  { id: "5", title: "Love", image: require("../assets/love.jpg"), folderId: "Keep your Google Drive Folder id" },
  { id: "6", title: "Elevation", image: require("../assets/elevation.jpg"), folderId: "Keep your Google Drive Folder id" },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const {stop,setCurrentSong}=useMusic();
  const [showAlert, setShowAlert] = useState(false);
const [alertMessage, setAlertMessage] = useState("");

const [activePopup, setActivePopup] = useState(null); 



// Button handler
const handlePopup = (type) => {
  setActivePopup(prev => (prev === type ? null : type));
};

  const handleGenrePress = (genre) => {
    navigation.navigate("MusicList", {
      folderId: genre.folderId,
      title: genre.title,
    });
  };
  const { dailyStats } = useMusic();
  const [showChart, setShowChart] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const todaySeconds = dailyStats[today] || 0;

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>

  <Text style={styles.headerTitle}>𝚄𝚗𝚒𝚚𝚞𝚎∞𝙼𝚞𝚜𝚒𝚌</Text>
  <View style={styles.headerButtons}>
    <TouchableOpacity onPress={() => handlePopup("heart")}>
      <Text style={styles.headerIcon}>🩵</Text>
    </TouchableOpacity>

    <TouchableOpacity onPress={() => handlePopup("sleep")}>
      <Text style={styles.headerIcon}>😴</Text>
    </TouchableOpacity>
  </View>


</View>

{/* Popup moved to component to reduce HomeScreen render cost */}
<PopupMenu activePopup={activePopup} setActivePopup={setActivePopup} stopPlayer={stop} showAlert={showAlert} alertMessage={alertMessage} setShowAlert={setShowAlert} setAlertMessage={setAlertMessage}/>
 <StyledAlert visible={showAlert} message={alertMessage} onClose={() => setShowAlert(false)} />
      {/* Scrollable Content */}
     <ScrollContainer
  style={{ backgroundColor: "#3b3b3b" }} 
  contentContainerStyle={{
    padding: CARD_MARGIN,
    paddingTop: CARD_MARGIN,   
    paddingBottom: 140,       
    backgroundColor: "#3b3b3b", 
  }}
>
  {genres.map((item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.card}
      onPress={() => handleGenrePress(item)}
    >
      <Image source={item.image} style={styles.image} resizeMode="cover" />
      <View style={styles.overlay}>
        <Text style={styles.genreText}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  ))}
 <View 
  style={{
    backgroundColor: "#111",
    width: "75%",
    height: 150,
    borderRadius: 14,
    borderWidth:0.3,
    borderColor:"#fff",
    alignSelf: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 16,
  }}
>

  {/* --- TIME DISPLAY (TOP CENTER) --- */}
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Text style={{ color: "white", fontSize: 30, fontWeight: "bold" }}>
      {formatTime(todaySeconds)}
    </Text>
  </View>

  {/* --- BOTTOM ROW (Play Time + Button FIXED CENTER ALIGN) --- */}
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",   
      justifyContent: "center", 
      
      marginBottom: 6,
    }}
  >
   <Image
      source={require("../assets/playtime.png")}
      style={{
        width: 200,    
        height: 40,    
        
      }}
    />

    <TouchableOpacity
      onPress={() => setShowChart(true)}
      style={{
        paddingHorizontal: 6,
        paddingVertical: 6,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#fff", 
      }}
    >
      <Svg width={22} height={22}>
        <Rect x="2" y="10" width="4" height="10" fill="#0af" />
        <Rect x="9" y="6" width="4" height="14" fill="#0af" />
        <Rect x="16" y="2" width="4" height="18" fill="#0af" />
      </Svg>
    </TouchableOpacity>
  </View>
</View>


      {/* ------- Modal Chart Window -------- remove until below segment */}
      <Modal visible={showChart} animationType="slide">
        <View style={{ flex: 1, backgroundColor: "#000", padding: 20 }}>
  <TouchableOpacity
    onPress={() => setShowChart(false)}
    style={{
      position: "absolute",
      top: 20,
      right: 20,
      zIndex: 999,
      padding:16,
    }}
  >
    <Text style={{ color: "white", fontSize: 15 }}>❌
</Text>
  </TouchableOpacity>

  <Text style={{ color: "white", fontSize: 24, marginTop: 20 }}>
    Last 7 Days Activity
  </Text>
   <WeeklyBarChart dailyStats={dailyStats} />
   
     
   
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
  <View
    style={{
      backgroundColor: "#3b3b3b",
      padding: 20,
      borderRadius: 12,
      height: 250,
      width: 300,
      marginVertical: 150,
    }}
  >
    {/* Header */}
    <Text
      style={{
        color: "#FFA500",
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
      }}
    >
      Music Stats
    </Text>

    {/* Avg Play Time */}
    <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 12 }}>
      <Text style={{ color: "#0af", fontSize: 18, fontWeight: "bold" }}>Avg-Play Time:</Text>
      <Text style={{ color: "white", fontSize: 16, fontWeight: "bold", marginLeft: 6 }}>
        {Math.floor(Object.values(dailyStats).reduce((a,b) => a+b, 0) / 7 / 60)} mins
      </Text>
    </View>

    {/* Min Play Time */}
    <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 12 }}>
      <Text style={{ color: "#0af", fontSize: 18, fontWeight: "bold" }}>Min-Play Time:</Text>
      <Text style={{ color: "white", fontSize: 16, fontWeight: "bold", marginLeft: 6 }}>
        {Math.floor(Math.min(...Object.values(dailyStats)) / 60)} mins
      </Text>
    </View>

    {/* Max Play Time */}
    <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
      <Text style={{ color: "#0af", fontSize: 18, fontWeight: "bold" }}>Max-Play Time:</Text>
      <Text style={{ color: "white", fontSize: 16, fontWeight: "bold", marginLeft: 6 }}>
        {Math.floor(Math.max(...Object.values(dailyStats)) / 60)} mins
      </Text>
    </View>

    {/* Optional: Songs Played */}
    <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 12 }}>
      <Text style={{ color: "#0af", fontSize: 18, fontWeight: "bold" }}>Songs Played:</Text>
      <Text style={{ color: "white", fontSize: 16, fontWeight: "bold", marginLeft: 6 }}>{Math.floor(Object.values(dailyStats)[0]/210)} songs</Text>
    </View>
  </View>
</View>
 </View>
 


     </Modal>  
</ScrollContainer>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0f0f0f", },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0f0f0f",
    paddingHorizontal: 20,
    paddingVertical: 15,
     borderWidth: 2,
    borderBottomColor: "#00aaff",
  },headerTitle: {
  color: "#FFFFFF",
  fontSize: 27,
  fontWeight: "600",         
  letterSpacing: 0.5,        
  fontFamily: "System",      
},headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15, 
  },

  headerIcon: {
    fontSize: 30,
  },

  title: { fontSize: 26, fontWeight: "bold", color: "#fff" },
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 30,
    backgroundColor: "#111",
    borderWidth: 2,
    borderColor: "#00aaff",
  },
  image: { width: "100%", height: "100%", opacity: 0.85 },
  overlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 12,
    alignItems: "center",
  },
  genreText: { color: "#00aaff", fontSize: 18, fontWeight: "700" },
  
  popupWrapper: {
    position: "absolute",
    top: 85,     
    right: 15,
    zIndex: 999,
    alignItems: "flex-end",
  },

 
  cone: {
    width: 7,
    height: 7,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "white", 
    marginBottom: -2, 
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  popupBox: {
    width:250,height:130,
    backgroundColor: "white",
    padding: 14,
    paddingHorizontal: 18,
    borderRadius: 7,
    shadowColor: "#fff",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  dialContainer: {
  width: 70,
  height: 70,
  borderWidth: 5,
  borderColor: "#0af",

  borderRadius: 15,
  marginTop: 8,
  overflow: "hidden",
  backgroundColor: "#000",
  justifyContent: "center",
},

dialNumber: {
  height: 36,
  textAlign: "center",
  fontSize: 18,
  lineHeight: 36,
  fontWeight: "600",
  color: "#fff",
},




});
