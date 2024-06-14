import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { View, TouchableOpacity, Text, Touchable } from "react-native";
import { StyleSheet } from "react-native";

import { useState } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CLIENT_ID =
  "289210557866-pbismlh5gqhcbfhg3g9movrg3e2k4eej.apps.googleusercontent.com";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

/**
 * Possibly completes an authentication session on web in a window popup.
 * The method should be invoked on the page that the window redirects to.
 */
WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  const [userInfo, setUserInfo] = useState<any>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: CLIENT_ID,
  });

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  async function getUserInfo(token: string) {
    try {
      if (!token) throw new Error("Missing token");
      const response = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const user = await response.json();
      if (!user) throw new Error("No user");
      await AsyncStorage.setItem("user", JSON.stringify(user));
      setUserInfo(user);
    } catch (error) {
      console.error("Failed to get user info", error);
    }
  }

  async function signInWithGoogle(response: any) {
    try {
      const userJSON = await AsyncStorage.getItem("user");

      if (userJSON) {
        setUserInfo(JSON.parse(userJSON));
      } else if (response?.type === "success") {
        getUserInfo(response.authentication.accessToken);
      }
    } catch (error) {
      console.error("Error retrieving user data");
    }
  }

  async function clearUser() {
    try {
      setUserInfo(null);
      await AsyncStorage.removeItem("user");
    } catch (error) {
      console.error("Error removing user from storage");
    }
  }

  useEffect(() => {
    signInWithGoogle(response);
  }, [response]);

  useEffect(() => {
    if (userInfo) console.log("User info", userInfo);
  }, [userInfo]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => promptAsync()}>
        <Text>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => clearUser()}>
        <Text>Sign Out</Text>
      </TouchableOpacity>
      <View>{userInfo && <Text>{userInfo.email}</Text>}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 50,
  },
});
