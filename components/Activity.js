import { useEffect } from "react";
import { useMusic } from "../context/MusicContext";

export default function Activity() {
  const { isPlaying, dailyStats, setDailyStats } = useMusic();
// handling music activity...
  useEffect(() => {
    let interval = null;

    if (isPlaying) {
      interval = setInterval(() => {
        const today = new Date().toISOString().split("T")[0];

        setDailyStats(prev => ({
          ...prev,
          [today]: (prev[today] || 0) + 1
        }));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPlaying]);

  return null; 
}
