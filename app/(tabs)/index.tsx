import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  Pressable, 
  Platform, 
  StatusBar, 
  Alert, 
  Modal, 
  Button
} from "react-native";
import { Link, Stack, router } from "expo-router";
import { useState, useEffect } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { checkBarcodeStatus } from "@/database/db";
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';

export default function Home() {
  const [permission, requestPermission] = useCameraPermissions();
  const [modalVisible, setModalVisible] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [modalType, setModalType] = useState<"found" | "notFound" | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    if (scanned) {
      const timeout = setTimeout(() => setScanned(false), 2000); // Reset scanned state after 1 second
      return () => clearTimeout(timeout);
    }
  }, [scanned]);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const BarcodeFoundModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>FOUND EXISTING RECORDS</Text>
            </View>
            <View>
              <Pressable
                onPress={() => router.push(`/create?barcode=${barcode}`)}>
                <LinearGradient
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  colors={['#AB3CB5', '#4B1A4F']}
                  style={styles.button}>
                  <Text style={styles.textStyle}>VIEW ITEM</Text>
                </LinearGradient>
              </Pressable>
              <Pressable
                style={[styles.buttonCancel]}
                onPress={() => setModalVisible(!modalVisible)}>
                <Text style={styles.textStyle}>CLOSE</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const BarcodeNotFoundModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>NO RECORDS FOUND</Text>
            </View>
            <View>
              <Pressable
                onPress={() => {
                  setModalVisible(!modalVisible);
                  router.push(`/create?barcode=${barcode}`);
                }}>
                <LinearGradient
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  colors={['#AB3CB5', '#4B1A4F']}
                  style={styles.button}>
                  <Text style={styles.textStyle}>ADD AS NEW A ITEM</Text>
                </LinearGradient>
              </Pressable>
              <Pressable
                  style={[styles.buttonCancel]}
                  onPress={() => setModalVisible(!modalVisible)}>
                  <Text style={styles.textStyle}>CANCEL</Text>
                </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const handleBarcode = async (barcode: string) => {
    if (!scanned) {
      setScanned(true); // limits scan
      setBarcode(barcode); // stores barcode
      checkBarcodeStatus(barcode).then((status) => {
        if (status === 0) {
          console.log("Barcode found");
          setModalVisible(true);
          setModalType("found"); // Set the modal type to "found"
        } else if (status === 1) {
          console.log("Barcode not found");
          setModalVisible(true);
          setModalType("notFound"); // Set the modal type to "notFound"
        } else {
          console.log("Error checking barcode.");
        }
      });
    }
  };

  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      <Stack.Screen
        options={{
          title: "Scan",
          headerShown: false,
        }}
      />
      {Platform.OS === "android" ? <StatusBar hidden /> : null}
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={(barcode) => {
          scanned ? undefined : handleBarcode(barcode.data);}}
      />

      
      {modalType === "found" && <BarcodeFoundModal />}
      {modalType === "notFound" && <BarcodeNotFoundModal />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white",
    justifyContent: "space-around",
    paddingVertical: 80,
  },
  title: {
    color: "white",
    fontSize: 40,
  },
  buttonStyle: {
    color: "#0E7AFE",
    fontSize: 20,
    textAlign: "center",
  },
  camera: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
    height: '40%',
  },
  button: {
    borderRadius: 20,
    padding: 10,
    margin: 10,
    elevation: 2,
    width: 285,
    justifyContent: 'center',
  },
  buttonCancel: {
    borderRadius: 20,
    padding: 10,
    margin: 10,
    elevation: 2,
    width: '80%',
    backgroundColor: '#212121',
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 20,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 50,
    color: 'white',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Semi-transparent background
  },
});