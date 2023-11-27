import { useNavigation } from "@react-navigation/native";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Video } from "expo-av";

import AsyncStorage from "@react-native-async-storage/async-storage";

const Splash = () => {
  const navigation = useNavigation();
  let screenToNavigate = "Splash";

  const getLocalStorage = async () => {
    try {
      const value = await AsyncStorage.getItem("studentNumber");
      console.log(value);
      if (value !== null) {
        // value previously stored
        screenToNavigate = "MainNavigator";
      } else {
        screenToNavigate = "Home";
      }
    } catch (e) {
      // error reading value
      console.log("error");
    }
  };

  useEffect(() => {
    getLocalStorage();
  }, []);

  return (
    <View style={styles.container}>
      {/* Use the Video component to play the MP4 video */}
      <Video
        source={require("../assets/video/SPLASHSCREEN.mp4")} // Update the path accordingly
        style={styles.backgroundVideo}
        shouldPlay
        isLooping={false}
        resizeMode="cover"
        onPlaybackStatusUpdate={(status) => {
          if (status.didJustFinish) {
            navigation.reset({
              index: 0,
              routes: [{ name: screenToNavigate }],
            });
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundVideo: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});

export default Splash;
