import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  ImageBackground,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
  const [studentNumber, setStudentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleLoginPress = async () => {
    if (studentNumber.trim() === "" || password.trim() === "") {
      Alert.alert(
        "Invalid Credentials",
        "Please fill in both fields before logging in."
      );
    } else {
      setLoading(true); // Set loading to true when starting login process
      try {
        const response = await axios.post(
          `https://nodejs-serverless-attendance.vercel.app/api/login`,
          {
            studentNumber,
            password,
          }
        );

        if (response.status === 200) {
          const name = response.data.name;

          await AsyncStorage.setItem("name", name);
          await AsyncStorage.setItem("studentNumber", studentNumber);
          await AsyncStorage.setItem("password", password);

          navigation.reset({
            index: 0,
            routes: [{ name: "MainNavigator" }],
          });
        } else {
          Alert.alert("Login Failed", "Invalid credentials. Please try again.");
        }
      } catch (error) {
        console.error("Login error:", error);
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
      } finally {
        setLoading(false); // Set loading to false when login process completes
      }
    }
  };

  return (
    <ImageBackground
      source={require("../assets/img/bg.png")}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons
            name="arrow-back"
            size={30}
            color="white"
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.text}>Log in</Text>
        <TextInput
          style={styles.input}
          placeholder="Student Number"
          onChangeText={(text) => setStudentNumber(text)}
          value={studentNumber}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          onChangeText={(text) => setPassword(text)}
          value={password}
        />
        <TouchableOpacity onPress={handleLoginPress} style={styles.button}>
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.buttonText}>LOG IN</Text>
          )}
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
  text: {
    color: "white",
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 40,
  },
  container: {
    flex: 1,
    justifyContent: "flex-start",
    padding: 20,
    paddingTop: 60,
  },
  backIcon: {
    marginBottom: 40,
  },
  input: {
    height: 55,
    borderColor: "#198754",
    backgroundColor: "white",
    borderWidth: 2,
    marginBottom: 16,
    paddingHorizontal: 18,
  },
  button: {
    marginTop: 10,
    backgroundColor: "#198754",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});
