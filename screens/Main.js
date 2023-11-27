import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import moment from "moment";
import axios from "axios";

export default function Main() {
  const absent = require(`../assets/img/absent.png`);
  const onqueue = require("../assets/img/onqueue.png");
  const present = require("../assets/img/present.png");
  const [modalScanLimitVisible, setModalScanLimitVisible] = useState(false);
  const [modalScanQueueMaxVisible, setModalScanQueueMaxVisible] =
    useState(false);
  const [status, setStatus] = useState("ABSENT");
  const [queue, setQueue] = useState([]);
  const [imageBackground, setImageBackground] = useState(absent);
  const [imagePath, setImagePath] = useState(null);
  const [name, setName] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    fetchImagePath();
    fetchUserDetails();
    requestImagePickerPermission();
    fetchStatusDetails();
  }, []);

  const fetchStatusDetails = async () => {
    let queueData = await AsyncStorage.getItem("queue");
    let attendanceLog = await AsyncStorage.getItem("attendanceLog");

    queueData = JSON.parse(queueData);
    attendanceLog = JSON.parse(attendanceLog);
    const date = moment().tz("Asia/Manila");

    if (queueData?.length > 0) {
      setStatus(`ON QUEUE (${queueData.length})`);
      setImageBackground(onqueue);
      setQueue(queueData);

      try {
        const response = await axios.post(
          `https://nodejs-serverless-attendance.vercel.app/api/qr`,
          {
            queue: queueData,
          },
          {
            timeout: 10000,
          }
        );

        if (response.status === 200) {
          if (
            attendanceLog &&
            attendanceLog[date.format("YYYY/MM/DD")]?.length > 0
          ) {
            attendanceLog[date.format("YYYY/MM/DD")] = attendanceLog[
              date.format("YYYY/MM/DD")
            ].concat(...queueData);
          } else {
            attendanceLog = {};
            attendanceLog[date.format("YYYY/MM/DD")] = queueData;
          }

          console.log(attendanceLog);

          await AsyncStorage.setItem(
            "attendanceLog",
            JSON.stringify(attendanceLog)
          );

          setStatus("PRESENT");
          setImageBackground(present);

          await AsyncStorage.setItem("queue", JSON.stringify([]));
        }
      } catch (error) {
        console.log(error);
      }
    } else if (attendanceLog[date.format("YYYY/MM/DD")]?.length > 0) {
      setStatus("PRESENT");
      setImageBackground(present);
    } else {
      setStatus("ABSENT");
      setImageBackground(absent);
    }
  };

  const fetchUserDetails = async () => {
    const name = await AsyncStorage.getItem("name");

    setName(name.match(/^\w+/)?.[0]);
  };

  const fetchImagePath = async () => {
    const path = await AsyncStorage.getItem("imagePath");

    if (path !== null) {
      setImagePath(path);
    }
  };

  const requestImagePickerPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      console.error("Permission to access media library was denied");
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      const imagePath = result.assets["0"]["uri"];
      await AsyncStorage.setItem("imagePath", imagePath);
      setImagePath(imagePath);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={imageBackground} style={styles.backgroundImage}>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.headerText}>1CS-C ROOM ATTENDANCE</Text>
          </View>
          <Text style={styles.statusText}>
            STATUS: <Text style={styles.statusTextSpan}>{status}</Text>
          </Text>
          <TouchableOpacity
            onPress={() => pickImage()}
            style={styles.centerImageContainer}
          >
            {imagePath !== null ? (
              <>
                <Image source={{ uri: imagePath }} style={styles.centerImage} />
              </>
            ) : (
              <Image
                source={require("../assets/img/image.jpg")}
                style={styles.centerImage}
              />
            )}
          </TouchableOpacity>

          <Text style={styles.bottomText}>HELLO,</Text>
          <Text style={styles.secondText}>I AM {`${name.toUpperCase()}`}</Text>

          <View style={styles.separator}>
            {/* Button at the bottom */}
            <TouchableOpacity
              onPress={async () => {
                const scanned = await AsyncStorage.getItem("scanned");

                const originalMoment = moment(scanned);
                const timeDiff = Math.abs(originalMoment - moment());

                if (queue?.length >= 3) {
                  setModalScanQueueMaxVisible(true);

                  setTimeout(() => setModalScanQueueMaxVisible(false), 3000);
                } else if (timeDiff <= 60000) {
                  setModalScanLimitVisible(true);

                  setTimeout(() => setModalScanLimitVisible(false), 3000);
                } else {
                  navigation.push("Scan");
                }
              }}
              style={styles.buttonContainer}
            >
              <Text style={styles.buttonText2}>SCAN QR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalScanLimitVisible}
        onRequestClose={() => setModalScanLimitVisible(!modalVisible)}
      >
        <View style={styles.modalContainer}>
          {/* Modal content */}
          <View
            style={[
              { paddingHorizontal: 40, borderColor: "#ED1D2B" },
              styles.modalContent,
            ]}
          >
            <Image
              source={require("../assets/img/queue.png")}
              style={styles.icon}
            />
            <Text style={styles.iconQueueText}>OOPS!</Text>
            <Text style={styles.iconQueueSubText}>
              YOU CAN ONLY SCAN ONE TIME PER HOUR
            </Text>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalScanQueueMaxVisible}
        onRequestClose={() => setModalScanQueueMaxVisible(!modalVisible)}
      >
        <View style={styles.modalContainer}>
          {/* Modal content */}
          <View
            style={[
              { paddingHorizontal: 40, borderColor: "#ED1D2B" },
              styles.modalContent,
            ]}
          >
            <Image
              source={require("../assets/img/queue.png")}
              style={styles.icon}
            />
            <Text style={styles.iconQueueText}>OOPS!</Text>
            <Text style={styles.iconQueueSubText}>MAXIMUM OF 3 QUEUES</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    backgroundColor: "rgba(0,0,0,1)",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  statusText: {
    alignItems: "center",
    position: "absolute",
    paddingVertical: 80,
    paddingHorizontal: 20,
    top: 0,
    left: 0,
    color: "white",
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Montserrat-Regular",
  },
  statusTextSpan: {
    fontFamily: "Montserrat-Bold",
  },
  centerImageContainer: {
    marginTop: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: "hidden",
    borderColor: "#198754",
    borderWidth: 4,
  },
  centerImage: {
    flex: 1,
    width: undefined,
    height: undefined,
    resizeMode: "cover",
  },
  bottomText: {
    color: "white",
    fontSize: 16,
    marginTop: 20,
    fontFamily: "Montserrat-Regular",
  },
  secondText: {
    color: "white",
    fontSize: 24,
    fontFamily: "Montserrat-Bold",
  },
  separator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
  buttonContainer: {
    alignItems: "center",
    padding: 15,
    backgroundColor: "#198754",
    borderRadius: 10,
  },
  buttonText2: {
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
  iconQueueText: {
    fontSize: 16,
    color: "#5974FF",
    fontWeight: "bold",
    fontFamily: "NunitoSans-Regular",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  iconQueueSubText: {
    fontSize: 10,
    color: "#5974FF",
    fontFamily: "NunitoSans-Regular",
    textAlign: "center",
    marginTop: 2,
  },
  icon: {
    width: 122,
    height: 58,
  },
});
