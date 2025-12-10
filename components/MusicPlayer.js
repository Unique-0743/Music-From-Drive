import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useEffect, useRef } from "react";
import { Animated, Dimensions, Image, PanResponder, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useMusic } from "../context/MusicContext";






export default function MusicPlayer({ onClose }) {
  const {
    currentSong,
    songList,
    setCurrentSong,
    soundRef,
    isPlaying,
    setIsPlaying,
    duration,
    position,
    isSeekingUI,
    setIsSeekingUI,
    setPosition,
    playSong,
    togglePlayPause,
    handleNext,
    handlePrev,
    manualPauseRef,
  } = useMusic();

  // quick UI-only guard
  if (!currentSong) return null;

  // to avoid immediate multiple ui loads...
  const skipTimeout = useRef(null);

  // Toggle play/pause 
  const onTogglePlay = async () => {
    await togglePlayPause();
  };


  // Next song play
  const onNext = () => {
    if (!songList?.length) return;
    const idx = songList.findIndex((s) => s.id === currentSong?.id);
    const next = songList[(idx + 1) % songList.length];

   
    setCurrentSong(next);

    if (skipTimeout.current) clearTimeout(skipTimeout.current);
    skipTimeout.current = setTimeout(() => {
     
      playSong(next, true).catch(() => {});
    }, 40);
  };
// Prev song play...
  const onPrev = () => {
    if (!songList?.length) return;
    const idx = songList.findIndex((s) => s.id === currentSong?.id);
    const prev = idx > 0 ? songList[idx - 1] : songList[songList.length - 1];

    setCurrentSong(prev);
    if (skipTimeout.current) clearTimeout(skipTimeout.current);
    skipTimeout.current = setTimeout(() => {
      playSong(prev, true).catch(() => {});
    }, 40);
  };

  // Slider handler
  const sliderValue = duration ? position / duration : 0;

  const onSlidingStart = () => setIsSeekingUI(true);

  const onValueChange = (v) => {
    if (duration > 0) setPosition(v * duration);
  };

  const onSlidingComplete = async (v) => {
    if (!soundRef.current || !duration) {
      setIsSeekingUI(false);
      return;
    }
    const ms = Math.floor(duration * v * 1000);
    try {
      await soundRef.current.setPositionAsync(ms);
      setPosition(ms / 1000);
    } catch (e) {
      
    } finally {
      setIsSeekingUI(false);
    }

    
    if (isPlaying && soundRef.current) {
      try { await soundRef.current.playAsync(); } catch (_) {}
    }
  };

  const thumbnailUri = currentSong?.thumbnail
    ? currentSong.thumbnail
    : currentSong?.id
    ? `ADD YOUR BACKEND SERVER URL${currentSong.id}`
    : null;
const playerRef = useRef(null);



// measure player AFTER render
const onLayoutPlayer = () => {
  if (!playerRef.current) return;

  playerRef.current.measure((fx, fy, width, height, px, py) => {
    // no need to store width/height unless you want boundaries
  });
};

const { height } = Dimensions.get("window");

const PLAYER_HEIGHT = 60;      
const TOP_LIMIT = 80;         
const BOTTOM_MARGIN = 0;      

// floating nature of music player
const pan = useRef(new Animated.Value(0)).current;


const restingBottom = BOTTOM_MARGIN;


const maxUp = height - PLAYER_HEIGHT - TOP_LIMIT - BOTTOM_MARGIN;

useEffect(() => {
  pan.setValue(0); // start at bottom
}, []);

const panResponder = useRef(
  PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      pan.setOffset(pan.__getValue ? pan.__getValue() : pan._value || 0);
      pan.setValue(0);
    },
    onPanResponderMove: Animated.event(
      [null, { dy: pan }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: () => {
      pan.flattenOffset();
      const cur = pan.__getValue ? pan.__getValue() : pan._value || 0;
      
      const clamped = Math.max(-maxUp, Math.min(cur, 0));
      Animated.spring(pan, {
        toValue: clamped,
        useNativeDriver: false,
        bounciness: 6,
        speed: 20,
      }).start();
    },
  })
).current;


return (
<Animated.View
  {...panResponder.panHandlers}
  style={[
    styles.playerBox,
    {
      position: "absolute",
      left:8,
      right:8,
      bottom: 20,
      transform: [{ translateY: pan }], 
      zIndex: 9999,
    },
  ]}
>














   
      <View style={styles.seekWrapper}>
        <View style={styles.seekBackground} />
        <View style={[styles.seekProgress, { width: `${sliderValue * 100}%` }]} />
        <Slider
          style={styles.seekSlider}
          minimumValue={0}
          maximumValue={1}
          value={sliderValue}
          minimumTrackTintColor="transparent"
          maximumTrackTintColor="transparent"
          thumbTintColor={isSeekingUI ? "#00BFFF" : "transparent"}
          onSlidingStart={onSlidingStart}
          onValueChange={onValueChange}
          onSlidingComplete={onSlidingComplete}
        />
      </View>

      <View style={styles.container}>
        {thumbnailUri ? (
          <Image source={{ uri: thumbnailUri }} style={styles.art} />
        ) : (
          <View style={styles.artPlaceholder}>
            <Ionicons name="musical-notes" size={28} color="#00aaff" />
          </View>
        )}

        <Text style={styles.title} numberOfLines={1}>
          {currentSong?.name.replace(/\.[^/.]+$/, "") || "No song selected"}
        </Text>

        <View style={styles.controls}>
          <TouchableOpacity onPress={onPrev} style={styles.controlBtn}>
            <Ionicons name="play-skip-back" size={28} color="#00aaff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={onTogglePlay} style={styles.controlBtn}>
            <Ionicons name={isPlaying ? "pause" : "play"} size={36} color="#00aaff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={onNext} style={styles.controlBtn}>
            <Ionicons name="play-skip-forward" size={28} color="#00aaff" />
          </TouchableOpacity>

        {onClose && (
  <TouchableOpacity
    onPress={async () => {
      try {
        // Stop audio safely (no direct setIsPlaying)
        if (soundRef.current) {
          await soundRef.current.stopAsync().catch(() => {});
          await soundRef.current.unloadAsync().catch(() => {});
        }

        // Reset UI state (no crash)
        setPosition(0);

        // Hide player
        setCurrentSong(null);

        // Call parent callback
        if (onClose) onClose();

      } catch (e) {
        console.log("Close error:", e);
      }
    }}
    style={styles.controlBtn}
  >
    <Ionicons name="close" size={28} color="#ff4444" />
  </TouchableOpacity>
)}


        </View>
      </View>
   
     </Animated.View>
  );
}
const styles = StyleSheet.create({
wrapper: { 
  
 
  
  zIndex: 9999
},


  seekWrapper: {
    width: "100%",
    height: 16,
    justifyContent: "center",
    marginBottom: -8,
    position: "relative",
    
  },
  playerBox: {
  zIndex: 9999,
}
,
playerOuter: {
  position: "absolute",
  zIndex: 99999,
}
,
  seekBackground: {
    position: "absolute",
    height: 6,
    left: 0,
    right: 0,
    borderRadius: 10,
    backgroundColor: "#333",
  },
  seekProgress: {
    position: "absolute",
    height: 6,
    left: 0,
    borderRadius: 10,
    backgroundColor: "#00BFFF",
  },
  seekSlider: { width: "100%", height: 40 },
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222222",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  art: { width: 48, height: 48, borderRadius: 6, marginRight: 12 },
  artPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: "#222222",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: "#fff", flex: 1, fontSize: 14, marginRight: 10 },
  controls: { flexDirection: "row", alignItems: "center" },
  controlBtn: { marginHorizontal: 6 },
});

