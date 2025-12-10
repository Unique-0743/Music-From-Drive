import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
  const [dailyStats, setDailyStats] = useState({});

 //states
  const [currentSong, setCurrentSong] = useState(null);
  const [songList, setSongList] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isSeekingUI, setIsSeekingUI] = useState(false);

  // internal refs
  const soundRef = useRef(null);
  const currentSongRef = useRef(null);
  const songListRef = useRef([]);
  const switchingRef = useRef(false);
  const manualPauseRef = useRef(false);
  const playTokenRef = useRef(0);
  const debounceRef = useRef(0);
  const isSwitchingRef = useRef(false);
  const appStateRef = useRef("active");
  // --- Background-safe stats tracking ---
const playStartRef = useRef(null);
const BG_PLAY_KEY = "BG_PLAY_START_TIME";
const autoSwitchRef = useRef(false);


 


  // Timer refs 
  const timerEndPositionRef = useRef(null); // target audio position in ms
  const timerEndWallClockRef = useRef(null); // fallback target Date.now() in ms

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      appStateRef.current = next;
    });

    return () => sub.remove();
  }, []);

  // Load saved stats when app opens
  useEffect(() => {
    const loadStats = async () => {
      try {
        const saved = await AsyncStorage.getItem("DAILY_STATS");
        if (saved) {
          setDailyStats(JSON.parse(saved));
        }
      } catch (e) {
        console.log("Failed to load stats:", e);
      }
    };
    loadStats();
  }, []);

  // Save stats whenever they change
  useEffect(() => {
    const saveStats = async () => {
      try {
        await AsyncStorage.setItem("DAILY_STATS", JSON.stringify(dailyStats));
      } catch (e) {
        console.log("Failed to save stats:", e);
      }
    };
    saveStats();
  }, [dailyStats]);
  useEffect(() => {
  const handler = async (state) => {
    // Going background: save timestamp
    if ((state === "background" || state === "inactive") && isPlaying) {
      if (!playStartRef.current) {
        playStartRef.current = Date.now();
      }
      await AsyncStorage.setItem(
        BG_PLAY_KEY,
        String(playStartRef.current)
      );
    }

    // Coming foreground: recover background playtime
    if (state === "active") {
      const saved = await AsyncStorage.getItem(BG_PLAY_KEY);

      if (saved) {
        const start = parseInt(saved, 10);
        const elapsed = Date.now() - start;

        if (elapsed > 0) {
          await addPlayTime(elapsed);
        }

        await AsyncStorage.removeItem(BG_PLAY_KEY);

        if (isPlaying) {
          playStartRef.current = Date.now();
        } else {
          playStartRef.current = null;
        }
      }
    }
  };

  const sub = AppState.addEventListener("change", handler);
  return () => sub.remove();
}, [isPlaying]);


  // setting sleeptimer under different conditions when the player is on, when the app is active or app running on background...
  const setSleepTimer = async (totalMinutes) => {
    if (!totalMinutes || totalMinutes <= 0) {
      // clear any existing timers
      timerEndPositionRef.current = null;
      timerEndWallClockRef.current = null;
      return;
    }

    const ms = totalMinutes * 60 * 1000;
    try {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status?.isLoaded) {
          const endPos = status.positionMillis + ms;
          timerEndPositionRef.current = endPos;
          timerEndWallClockRef.current = null;
         
          console.log(`[MusicContext] Sleep timer set by position -> stop at ${endPos} ms`);
          return;
        }
      }
    } catch (err) {
      console.warn("[MusicContext] Error reading sound status for timer", err);
    }


    timerEndWallClockRef.current = Date.now() + ms;
    timerEndPositionRef.current = null;
    console.log(`[MusicContext] Sleep timer set by wall-clock -> stop at ${timerEndWallClockRef.current}`);
  };

  // keep refs in sync
  const updateCurrentSong = (song) => {
    currentSongRef.current = song;
    setCurrentSong(song);
  };

  const updateSongList = (list) => {
    songListRef.current = list;
    setSongList(list);
  };
 // for background stats calculation we add playtime that ran in background.
const addPlayTime = async (ms) => {
  if (!ms || ms <= 0) return;

  const today = new Date().toISOString().split("T")[0];

  setDailyStats((prev) => {
    const updated = {
      ...prev,
      [today]: (prev[today] || 0) + Math.floor(ms / 1000),
    };

    AsyncStorage.setItem("DAILY_STATS", JSON.stringify(updated)).catch(() => {});
    return updated;
  });
};


  // central playback listener (handles UI updates, auto-next, and sleep timer)
  const handlePlaybackStatus = async (status) => {

    if (!status || !status.isLoaded) return;
   
if (status.isPlaying) {
  if (!playStartRef.current) {
    playStartRef.current = Date.now();
    AsyncStorage.removeItem(BG_PLAY_KEY).catch(() => {});
  }
} else {
  if (playStartRef.current) {
    
    if (!autoSwitchRef.current) {
      const elapsed = Date.now() - playStartRef.current;
      await addPlayTime(elapsed);
    }

    playStartRef.current = null;
    autoSwitchRef.current = false;
  }
}



    
    try {
      if (timerEndPositionRef.current && status.positionMillis >= timerEndPositionRef.current) {
        console.log("[MusicContext] Sleep timer reached by audio position -> stopping playback");
        
        timerEndPositionRef.current = null;
        timerEndWallClockRef.current = null;
        await stop();
        setCurrentSong(null);
        return;
      }

     
      if (!isSeekingUI) setPosition(status.positionMillis / 1000);
      setDuration(status.durationMillis / 1000);

      

if (!manualPauseRef.current) {
  setIsPlaying(status.isPlaying);
}


      
      if (status.didJustFinish && !manualPauseRef.current) {
         autoSwitchRef.current = true;
        const list = songListRef.current;
        const curr = currentSongRef.current;
        if (!list || !curr) return;

        const idx = list.findIndex((s) => s.id === curr.id);
        const next = list[(idx + 1) % list.length];

        updateCurrentSong(next);

        if (appStateRef.current === "active") {
          setTimeout(() => {
            playSong(next, true).catch((e) => console.warn("autonext FG failed:", e));
          }, 50);
        } else {
          playSong(next, true).catch((e) => console.warn("autonext BG failed:", e));
        }
      }
    } catch (e) {
      console.error("[MusicContext] playback listener error", e);
    }
  };

  // playing a song and handling autoplay 
  const playSong = async (song, autoPlay = true) => {
    if (!song || !song.id) return;

    const token = ++playTokenRef.current;

    try {
      // unload previous
      if (soundRef.current) {
        try {
          
          await soundRef.current.unloadAsync();

        } catch {}
      }

      // create sound
      const { sound } = await Audio.Sound.createAsync({ uri: song.url });

      // token check
      if (token !== playTokenRef.current) {
        try {
          await sound.unloadAsync();
        } catch {}
        return;
      }

      soundRef.current = sound;
      
try {
  if (timerEndWallClockRef.current && sound) {
    const status = await sound.getStatusAsync();
    if (status?.isLoaded) {
      const remainingMs =
        timerEndWallClockRef.current - Date.now();

      if (remainingMs > 0) {
        timerEndPositionRef.current =
          status.positionMillis + remainingMs;
        timerEndWallClockRef.current = null;

        console.log("[MusicContext] Timer upgraded to position-based");
      }
    }
  }
} catch (e) {
  console.log("Timer conversion failed:", e);
}


     
      sound.setOnPlaybackStatusUpdate(handlePlaybackStatus);

      // Try to keep active in background 
      try {
        await sound.setStatusAsync({ staysActiveInBackground: true });
      } catch (e) {
        // not critical, but useful to log
        console.warn("setStatusAsync(staysActiveInBackground) failed:", e);
      }

      updateCurrentSong(song);

      if (autoPlay && !manualPauseRef.current) {
        try {
          await sound.playAsync();
          setIsPlaying(true);
        } catch (e) {
          console.warn("playAsync failed:", e);
          setIsPlaying(false);
        }
      } else {
        setIsPlaying(false);
      }
    } catch (e) {
      console.log("playSong error:", e);
    }
  };

  
  const selectSongFromFolder = async (folderSongs, selectedSong) => {
    const normalized = (folderSongs || []).map((s) =>
      s.url ? s : { ...s, url: `ENTER YOUR SERVER URL HERE?fileId=${s.id}` }
    );

    updateSongList(normalized);

    manualPauseRef.current = false;

    await playSong(selectedSong, true);
  };

  const togglePlayPause = async () => {
    if (!soundRef.current) return;
    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isPlaying) {
        await soundRef.current.pauseAsync();
        manualPauseRef.current = true;
        setIsPlaying(false);
      } else {
        await soundRef.current.playAsync();
        manualPauseRef.current = false;
        setIsPlaying(true);
      }
    } catch (e) {}
  };

  const seekTo = async (seconds) => {
    if (!soundRef.current) return;
    try {
      await soundRef.current.setPositionAsync(Math.floor(seconds * 1000));
      setPosition(seconds);
    } catch (e) {}
  };

  const pause = async () => {
    if (!soundRef.current) return;
    try {
      await soundRef.current.pauseAsync();
    } catch (_) {}
    manualPauseRef.current = true;
    setIsPlaying(false);
  };

  const resume = async () => {
    if (!soundRef.current) return;
    try {
      await soundRef.current.playAsync();
    } catch (_) {}
    manualPauseRef.current = false;
    setIsPlaying(true);
  };

  const stop = async () => {
    if (!soundRef.current) return;
    try {
      await soundRef.current.stopAsync();
    } catch (_) {}
    try {
      await soundRef.current.unloadAsync();
    } catch (_) {}
    setIsPlaying(false);
    setPosition(0);
    manualPauseRef.current = false;

    // clear timers when stopped manually
    timerEndPositionRef.current = null;
    timerEndWallClockRef.current = null;
    

  };

  const handleNext = async () => {
    const list = songListRef.current;
    if (!list || !list.length) return;
    const idx = list.findIndex((s) => s.id === currentSongRef.current?.id);
    const next = list[(idx + 1) % list.length];
    updateCurrentSong(next);
    await playSong(next, true);
  };

  const handlePrev = async () => {
    const list = songListRef.current;
    if (!list || !list.length) return;
    const idx = list.findIndex((s) => s.id === currentSongRef.current?.id);
    const prev = idx > 0 ? list[idx - 1] : list[list.length - 1];
    updateCurrentSong(prev);
    await playSong(prev, true);
  };

  
  useEffect(() => {
    let iv = null;
    if (timerEndWallClockRef.current) {
      iv = setInterval(() => {
        try {
          if (timerEndWallClockRef.current && Date.now() >= timerEndWallClockRef.current) {
            console.log("[MusicContext] Sleep timer reached by wall-clock -> stopping playback");
            timerEndWallClockRef.current = null;
            timerEndPositionRef.current = null;
            stop();
            setCurrentSong(null);
          }
        } catch (e) {
          console.warn("[MusicContext] wall-clock timer check error", e);
        }
      }, 1000);
    }
    return () => {
      if (iv) clearInterval(iv);
    };
  }, []);

  return (
    <MusicContext.Provider
      value={{
        currentSong,
        songList,
        isPlaying,
        duration,
        position,
        isSeekingUI,
        dailyStats,
       
        setSleepTimer,
        setDailyStats,

        soundRef,
        manualPauseRef,
        switchingRef,

        setIsSeekingUI,
        setPosition,
        setDuration,

        playSong,
        selectSongFromFolder,
        togglePlayPause,
        seekTo,
        pause,
        resume,
        stop,
        handleNext,
        handlePrev,

        setSongList: updateSongList,
        setCurrentSong: updateCurrentSong,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => useContext(MusicContext);
export default MusicContext;
