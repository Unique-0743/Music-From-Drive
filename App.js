
// Assembling various components in this main entry...
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { Animated, SafeAreaView, StyleSheet, Text, View } from "react-native";
import ActivityTracker from "./components/Activity";
import MusicPlayer from "./components/MusicPlayer";
import { MusicProvider, useMusic } from "./context/MusicContext";
import EmojiPlayerScreen from "./screens/EmojiPlayerScreen";
import HomeScreen from "./screens/HomeScreen";
import MusicListScreen from "./screens/MusicListScreen";
import { getToken, saveToken } from "./utils/tokenStorage";

const Stack = createNativeStackNavigator();

function MainApp() {
  const { currentSong, setCurrentSong, songList, setSongList } = useMusic();
  const [accessToken, setAccessToken] = useState(null);


  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token) {
        setAccessToken(token);
        global.googleAccessToken = token;
      }
    })();
  }, []);
 const fadeAnim = useRef(new Animated.Value(1)).current;
const [visible, setVisible] = useState(true);

useEffect(() => {
  const timer = setTimeout(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  }, 1200);

  return () => clearTimeout(timer);
}, []);



  const handleLoginSuccess = async (token) => {
    setAccessToken(token);
    global.googleAccessToken = token;
    await saveToken(token);
  };

  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      interruptionModeAndroid: 1,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
       
    });
  }, []);
   
   

  return (
    <SafeAreaView style={styles.container}>
      {visible && (
  <Animated.View
    style={[
      StyleSheet.absoluteFillObject,
      {
        backgroundColor: "#ffffff",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
        opacity: fadeAnim,
      },
    ]}
  >
    <View style={styles.logoBox}>
      <Animated.Image
        source={require("./assets/icon.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
    <View style={{paddingTop:"15"}}><Text style={{fontSize:20,fontWeight:"bold"}}>Unique∞Music</Text></View>
  </Animated.View>
)}

      <NavigationContainer
        onStateChange={(state) => {
          const current = state.routes[state.index].name;
          global.currentRouteName = current;
        }}
      >
        <Stack.Navigator
          screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#000" } }}
        >
          <Stack.Screen name="Home">
            {(props) => (
              <HomeScreen
                {...props}
                accessToken={accessToken}
                onLoginSuccess={handleLoginSuccess}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="EmojiPlayerScreen" component={EmojiPlayerScreen} />

          <Stack.Screen name="MusicList">
            {(props) => (
              <MusicListScreen
                {...props}
                onSongSelect={setCurrentSong}
                onSongsLoaded={setSongList}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>

      {/* Hide player when inside EmojiPlayerScreen */}
      {currentSong && global.currentRouteName !== "EmojiPlayerScreen" && (
        <MusicPlayer
          onNext={(next) => next && setCurrentSong(next)}
          onPrev={(prev) => prev && setCurrentSong(prev)}
          onClose={() => setCurrentSong(null)}
        />
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <MusicProvider>
      <MainApp />
      <ActivityTracker />
    </MusicProvider>
  );
}

const styles = StyleSheet.create({
  
  container: { flex: 1, backgroundColor: "#fff" },
  logoBox: {
  backgroundColor: "#000",
  
  borderRadius: 30,
  elevation: 10,
  shadowColor: "#000",
  shadowOpacity: 0.2,
  shadowRadius: 15,
},
logo: {
  width: 200,
  height: 200,
  borderRadius:30,
},

});
