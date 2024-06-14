import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { View, TouchableOpacity, Text } from "react-native";
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
  const [userInfo, setUserInfo] = useState(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: CLIENT_ID,
  });

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  async function getUserInfo(token: any) {
    if (!token) return console.log("missing token");

    console.log("token", token);
  }

  async function signInWithGoogle(response: any) {
    try {
      console.log("response", response);
      getUserInfo(response.authentication.accessToken);
    } catch (error) {
      console.log("Error retrieving user data");
    }
  }

  useEffect(() => {
    signInWithGoogle(response);
  }, [response]);

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 50,
  },
});
