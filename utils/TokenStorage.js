
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "googleAccessToken";

export async function saveToken(token) {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.log("Error saving token:", error);
  }
}

export async function getToken() {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.log("Error getting token:", error);
    return null;
  }
}

export async function clearToken() {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.log("Error clearing token:", error);
  }
}
