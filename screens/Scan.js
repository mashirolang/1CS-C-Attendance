import React, { useState } from "react";
import {
  Button,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Camera, CameraType } from "expo-camera";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarCodeScanner } from "expo-barcode-scanner";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import moment from "moment-timezone";

export default function Scan() {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [modalSuccessVisible, setModalSuccessVisible] = useState(false);
  const [modalQueueVisible, setModalQueueVisible] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationPermissionRequested, setLocationPermissionRequested] =
    useState(false);

  const navigation = useNavigation();

  React.useEffect(() => {
    const requestLocationPermission = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        console.log("Location permission denied");
        setLocationPermissionRequested(true); // Update the state to indicate that permission has been requested
        setLocationPermissionRequested(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    };

    if (!locationPermissionRequested) {
      requestLocationPermission();
    }
  }, [locationPermissionRequested]);

  const subjects = [
    "NSTP",
    "MAT",
    "PSY",
    "READ",
    "CCS101",
    "CCS102",
    "PHD",
    "PED",
    "GAD",
  ];

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  const handleBarCodeScanned = async ({ data }) => {
    // READ-303
    if (subjects.includes(data.split("-")[0])) {
      setScanned(true);

      const date = moment().tz("Asia/Manila");

      const json = {
        scanTime: date.format("HH:mm:ss"),
        scanDate: date.format("YYYY/MM/DD"),
        studentNumber: await AsyncStorage.getItem("studentNumber"),
        name: await AsyncStorage.getItem("name"),
        location: location,
        code: data,
        phoneDetails: Device.modelName,
      };
      console.log(json);

      try {
        const response = await axios.post(
          `https://nodejs-serverless-attendance.vercel.app/api/qr`,
          {
            queue: [json],
          },
          {
            timeout: 10000,
          }
        );

        if (response.status === 200) {
          setModalSuccessVisible(true);

          let attendanceLog = await AsyncStorage.getItem("attendanceLog");

          attendanceLog = JSON.parse(attendanceLog);
          console.log(attendanceLog);
          if (
            attendanceLog &&
            attendanceLog[date.format("YYYY/MM/DD")]?.length > 0
          ) {
            attendanceLog[date.format("YYYY/MM/DD")].push(json);
          } else {
            attendanceLog = {};
            attendanceLog[date.format("YYYY/MM/DD")] = [json];
          }

          console.log(attendanceLog);

          await AsyncStorage.setItem(
            "attendanceLog",
            JSON.stringify(attendanceLog)
          );
        }
      } catch (error) {
        let queue = await AsyncStorage.getItem("queue");
        queue = JSON.parse(queue);
        if (queue?.length > 0) {
          queue.push(json);
          await AsyncStorage.setItem("queue", JSON.stringify(queue));
          setModalQueueVisible(true);
        } else {
          await AsyncStorage.setItem("queue", JSON.stringify([json]));
          setModalQueueVisible(true);
        }

        console.log(error);
      } finally {
        await AsyncStorage.setItem(
          "scanned",
          moment().tz("Asia/Manila").format("YYYY-MM-DDTHH:mm:ssZ")
        );

        setTimeout(() => {
          setModalQueueVisible(false);
          setModalSuccessVisible(false);

          navigation.reset({
            index: 0,
            routes: [{ name: "Main" }],
          });
        }, 2000);
      }
    }
  };

  if (!locationPermissionRequested || !permission.granted) {
    // Location permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to access location and show the camera
        </Text>
        <Button
          onPress={() => {
            requestPermission();
            setLocationPermissionRequested(true);
          }}
          title="Grant Permission"
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }}>
      <View style={styles.container}>
        <Camera
          ratio="16:9"
          style={styles.camera}
          type={CameraType.back}
          useCamera2Api={false}
          barCodeScannerSettings={{
            barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
          }}
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        >
          <View style={styles.cameraContainer}>
            <Image
              source={require("../assets/img/logo.png")}
              style={styles.logoImage}
            />
            <Image
              source={require("../assets/img/scan.png")}
              style={styles.centerImage}
            />
            <View style={styles.horizontalTextContainer}>
              <Text style={styles.text}>S</Text>
              <Text style={styles.text}>C</Text>
              <Text style={styles.text}>A</Text>
              <Text style={styles.text}>N</Text>
              <Text style={styles.text}> </Text>
              <Text style={styles.text}>T</Text>
              <Text style={styles.text}>H</Text>
              <Text style={styles.text}>E</Text>
              <Text style={styles.text}> </Text>
              <Text style={styles.text}>Q</Text>
              <Text style={styles.text}>R</Text>
            </View>
          </View>
        </Camera>
        <View style={styles.header}>
          <Text style={styles.headerText}>1CS-C ROOM ATTENDANCE</Text>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalQueueVisible}
        onRequestClose={() => setModalQueueVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Modal content */}
          <View
            style={[
              { paddingHorizontal: 60, borderColor: "#ED1D2B" },
              styles.modalContent,
            ]}
          >
            <Image
              source={require("../assets/img/queue.png")}
              style={styles.icon}
            />
            <Text style={styles.iconQueueText}>NO INTERNET</Text>
            <Text style={styles.iconQueueSubText}>
              ERROR CONNECTING TO SERVER, YOUR ATTENDANCE IS ON QUEUE
            </Text>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalSuccessVisible}
        onRequestClose={() => setModalSuccessVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Modal content */}
          <View
            style={[
              { paddingHorizontal: 110, borderColor: "#198754" },
              styles.modalContent,
            ]}
          >
            <Image
              source={require("../assets/img/success.png")}
              style={styles.icon}
            />
            <Text style={styles.iconSuccessText}>ATTENDANCE SUBMITTED!</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  icon: {
    width: 122,
    height: 58,
  },
  horizontalTextContainer: {
    flexDirection: "row", // Display the text horizontally
  },
  iconSuccessText: {
    fontSize: 16,
    color: "#198754",
    fontWeight: "bold",
    fontFamily: "NunitoSans-Regular",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  iconQueueText: {
    fontSize: 16,
    color: "#ED1D2B",
    fontWeight: "bold",
    fontFamily: "NunitoSans-Regular",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  iconQueueSubText: {
    fontSize: 10,
    color: "#198754",
    fontFamily: "NunitoSans-Regular",
    textAlign: "center",
    marginTop: 2,
  },
  camera: {
    flex: 1,
    alignItems: "center", // Center horizontally
    justifyContent: "center", // Center vertically
  },
  cameraContainer: {
    flex: 1,
    alignItems: "center", // Center horizontally
    justifyContent: "center", // Center vertically
    marginTop: -90,
  },
  centerImage: {
    width: 330, // Adjust the width and height based on your image size
    height: 330,
    marginBottom: 40,
  },
  logoImage: {
    width: 166, // Adjust the width and height based on your image size
    height: 76,
    marginBottom: 30,
  },
  header: {
    backgroundColor: "#198754",
    padding: 15,
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  headerText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Montserrat-Bold",
  },
  text: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Montserrat-Bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    paddingVertical: 25,
    borderRadius: 60,
    alignItems: "center",

    borderWidth: 5,
    marginTop: -40,
  },
});
