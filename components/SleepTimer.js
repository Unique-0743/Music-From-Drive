
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const BOX = 30;
const HOURS_DATA = Array.from({ length: 24 }, (_, i) => i);
const MINUTES_DATA = Array.from({ length: 60 }, (_, i) => i);

function Sleeptimer({ onChange }, ref) {
  const hourRef = useRef(null);
  const minRef = useRef(null);

  const [hourValue, setHourValue] = useState(0);
  const [minValue, setMinValue] = useState(0);

  // ------- setting time --------
  useImperativeHandle(ref, () => ({
    setTime: (h, m) => {
      const hourIndex = HOURS_DATA.indexOf(h);
      const minIndex = MINUTES_DATA.indexOf(m);

      if (hourIndex >= 0) {
        hourRef.current?.scrollTo({
          y: hourIndex * BOX,
          animated: true,
        });
      }
      if (minIndex >= 0) {
        minRef.current?.scrollTo({
          y: minIndex * BOX,
          animated: true,
        });
      }

      setHourValue(h);
      setMinValue(m);

      onChange?.({ hours: h });
      onChange?.({ minutes: m });
    },
  }));

  const centerValue = (ref, list, isHour) => {
    if (!ref.current) return;

    const y = ref.current._scrollPos || 0;
    const index = Math.round(y / BOX);

    const value = list[index];

    if (isHour) {
      setHourValue(value);
      onChange?.({ hours: value });
    } else {
      setMinValue(value);
      onChange?.({ minutes: value });
    }
  };

  const onScroll = (e, ref) => {
    if (!ref.current) return;
    ref.current._scrollPos = e.nativeEvent.contentOffset.y;
  };

  return (
    <View style={styles.container}>
      {/* Hours */}
      <View style={styles.column}>
        <Text style={styles.label}>Hours</Text>
        <View style={styles.box}>
          <ScrollView
            ref={hourRef}
            onScroll={(e) => onScroll(e, hourRef)}
            onMomentumScrollEnd={() => centerValue(hourRef, HOURS_DATA, true)}
            snapToInterval={BOX}
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
          >
            {HOURS_DATA.map((num) => (
              <View key={num} style={[styles.item, { height: BOX }]}>
                <Text style={styles.itemText}>{num}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Minutes */}
      <View style={styles.column}>
        <Text style={styles.label}>Minutes</Text>
        <View style={styles.box}>
          <ScrollView
            ref={minRef}
            onScroll={(e) => onScroll(e, minRef)}
            onMomentumScrollEnd={() => centerValue(minRef, MINUTES_DATA, false)}
            snapToInterval={BOX}
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
          >
            {MINUTES_DATA.map((num) => (
              <View key={num} style={[styles.item, { height: BOX }]}>
                <Text style={styles.itemText}>{num}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

export default forwardRef(Sleeptimer);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
    height: 70,
    width: 120,
    justifyContent: "center",
    backgroundColor: "#ccc",
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#0af",
  },
  column: {
    alignItems: "center",
  },
  label: {
    color: "#000",
    fontWeight: "600",
    marginBottom: 6,
    fontSize: 15,
  },
  box: {
    width: 30,
    height: 30,
    borderWidth: 1.5,
    borderColor: "#000",
    overflow: "hidden",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  item: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  itemText: {
    color: "#000",
    fontSize: 16,
  },
});
