import { useState } from "react";
import { Text, View } from "react-native";
import Svg, { Rect } from "react-native-svg";

export default function WeeklyBarChart({ dailyStats }) {
  const [selectedBar, setSelectedBar] = useState(null);

  const days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const values = days.map(d => Math.floor((dailyStats[d] || 0) / 60));
  const max = 500;

  return (
    <View style={{ marginTop: 20 }}>

      {/* Selected bar time display */}
      <Text
        style={{
          color: "white",
          fontSize: 14,
          textAlign: "center",
          marginBottom: 10,
        }}
      >
        {selectedBar !== null ? `${selectedBar} mins` : ""}
      </Text>

      <Svg height="150" width="100%">
        {values.map((v, i) => {

          const barHeight = (v/ max)*150 ;
          const barWidth = 30;
          const gap = 18;

          return (
            <Rect 
              key={i}
              x={i * (barWidth + gap)}
              y={150 - barHeight}
              width={barWidth}
              height={barHeight}
              fill="#0af"
              rx={4}
              
              
              
              onPress={() => setSelectedBar(v)}
            />
          );
        })}
      </Svg>

      {/* Weekday labels */}
     <View style={{ flexDirection: "row", marginTop: 8 }}>
        {days.map((date, i) => (
          <Text
            key={i}
            style={{
              color: "white",
              width: 48,
              fontSize: 15,
              textAlign: "center",
            }}
          >
            {new Date(date).toLocaleDateString("en-US", { weekday: "short" })}
          </Text>
        ))}
      </View>
    </View>
  );
}
