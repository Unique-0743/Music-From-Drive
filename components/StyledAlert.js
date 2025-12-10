import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function StyledAlert({ visible, message, onClose }) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          <Text style={styles.alertText}>{message}</Text>
          <TouchableOpacity onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingBottom:450,
    justifyContent:"center",
    alignItems: "center",
  },
  alertBox: {
    width: 250,
    backgroundColor: "#0af",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  alertText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#fff",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: "#0af",
    fontWeight: "bold",
    fontSize: 14,
  },
});
