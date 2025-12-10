import React, { useRef, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { useMusic } from "../context/MusicContext";
import Fav from "./Fav";
import Sleeptimer from "./Sleeptimer";

function PopupMenu({ activePopup, setActivePopup, alertMessage, setAlertMessage, setShowAlert }) {
  const sleepTimerRef = useRef(null);
  
  const { stop, setCurrentSong,setSleepTimer, localSongs } = useMusic();

  const [sleepTime, setSleepTime] = useState({ hours: 0, minutes: 0 });
  const [showDropdown, setShowDropdown] = useState(false);

  if (!activePopup) return null;

  // Quick select sleep time
  const applyQuickSelect = (min) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    setSleepTime({ hours: h, minutes: m });
    sleepTimerRef.current?.setTime(h, m);
    setShowDropdown(false);
  };

 

const handleSetTimer = () => {
  const { hours, minutes } = sleepTime;
  const totalMinutes = hours * 60 + minutes;

  if (totalMinutes <= 0) {
    setAlertMessage("Please select a valid time.");
    setShowAlert(true);
    return;
  }

  
  setSleepTimer(totalMinutes);  

  setActivePopup(null);
  setAlertMessage(
    totalMinutes === 1
      ? `Music Stops after 1 minute`
      : `Music Stops after ${totalMinutes} minutes`
  );
  setShowAlert(true);
};


  // Synchronous function for Fav.js
  const handleEmojiSelect = (emoji) => {
    if (!localSongs || localSongs.length === 0) {
      Alert.alert("No songs available to assign");
      return null;
    }
    return localSongs[0]; 
  };

  return (
    <View style={{ position: "absolute", top: 85, right: 15, zIndex: 999, alignItems: "flex-end" }}>
      {/* Triangle */}
      <View
        style={[
          {
            width: 7,
            height: 7,
            borderLeftWidth: 8,
            borderRightWidth: 8,
            borderBottomWidth: 12,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            marginBottom: -2,
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 4,
          },
          activePopup === "heart"
            ? { borderBottomColor: "white", right: 59 }
            : { borderBottomColor: "white", right: 13 },
        ]}
      />

      <View
        style={{
          backgroundColor: "white",
          padding: 14,
          paddingHorizontal: 18,
          borderRadius: 7,
          shadowColor: "#fff",
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 4,
          width: 200,
          height: activePopup === "heart" ? 130 : 160,
        }}
      >
        {activePopup === "heart" && <Fav songs={localSongs} onSelect={handleEmojiSelect} />}

        {activePopup === "sleep" && (
          <View style={{ marginTop: 19, alignItems: "center", justifyContent: "center" }}>
            <Text
              style={{
                position: "absolute",
                top: -30,
                left: -7,
                fontWeight: "bold",
                fontSize: 20,
                color: "#000",
              }}
            >
              Sleeptimer
            </Text>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Sleeptimer
                ref={sleepTimerRef}
                onChange={(v) => setSleepTime((prev) => ({ ...prev, ...v }))}
              />
              <TouchableOpacity onPress={() => setShowDropdown((prev) => !prev)}>
                <Text style={{ fontSize: 20, marginLeft: 10 }}>⬇️</Text>
              </TouchableOpacity>
            </View>

            {showDropdown && (
              <View
                style={{
                  position: "absolute",
                  width: 60,
                  top: 60,
                  right: -20,
                  backgroundColor: "#fff",
                  borderWidth: 1,
                  borderColor: "#000",
                  borderRadius: 6,
                  overflow: "hidden",
                  zIndex: 999,
                }}
              >
                {[5, 15, 30].map((min) => (
                  <TouchableOpacity key={min} onPress={() => applyQuickSelect(min)}>
                    <Text style={styles.menuItem}>{min} min</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity onPress={handleSetTimer}>
              <View
                style={{
                  marginTop: 12,
                  marginRight: 25,
                  backgroundColor: "#0af",
                  paddingVertical: 10,
                  paddingHorizontal: 10,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: "#000",
                }}
              >
                <Text style={{ color: "white", fontWeight: "700", fontSize: 14 }}>Set Timer</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = {
  menuItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
};

export default React.memo(PopupMenu);
