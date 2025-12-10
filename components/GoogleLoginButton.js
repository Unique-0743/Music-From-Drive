
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";


const ANDROID_CLIENT_ID = "ADD YOUR GOOGLE ANDROID CLIENT ID HERE";

export default function GoogleLoginButton({ onLoginSuccess }) {
  const handleLogin = async () => {
    try {
      // Mobile flow using Expo AuthSession
      const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${ANDROID_CLIENT_ID}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=token&scope=https://www.googleapis.com/auth/drive.readonly`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === "success" && result.url.includes("access_token")) {
        const token = result.url.match(/access_token=([^&]*)/)[1];
        Alert.alert("✅ Login Successful", "Google Drive connected!");
        onLoginSuccess(token);
      } else {
        Alert.alert("❌ Login failed or cancelled.");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleLogin}>
      <Text style={styles.text}>Sign in with Google</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#4285F4",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
