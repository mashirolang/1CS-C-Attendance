import { useNavigation } from "@react-navigation/native";
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

export default function Home() {
  const navigation = useNavigation();

  return (
    <ImageBackground
      source={require("../assets/img/bg.png")}
      style={styles.backgroundImage}
    >
      <View style={styles.overlay}>
        <Animated.Image
          entering={FadeInDown.delay(200).duration(1000).springify()}
          source={require("../assets/img/logo.png")}
          style={styles.foregroundImage}
        />

        <Animated.View
          entering={FadeInDown.delay(400).duration(1500).springify()}
          style={styles.separator}
        >
          {/* Button at the bottom */}
          <TouchableOpacity
            onPress={() => navigation.push("Login")}
            style={styles.buttonContainer}
          >
            <Text style={styles.buttonText}>LOG IN</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover", // or 'stretch' or 'contain'
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // Adjust the opacity as needed
    justifyContent: "center",
    alignItems: "center",
  },
  foregroundImage: {
    width: width * 1, // Set the width to 80% of the screen width
    height: height * 0.25, // Set the height to maintain the aspect ratio
    marginBottom: height * 0.11, // Set the margin to 5% of the screen height
  },
  separator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 30,
    borderRadius: 10,
  },
  buttonContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#198754",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
