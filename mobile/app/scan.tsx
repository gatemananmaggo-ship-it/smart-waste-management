import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const router = useRouter();

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

  const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    // Handle the scanned data (e.g., if it's a mobile:// link)
    console.log(`Bar code with type ${type} and data ${data} has been scanned!`);
    
    // If it's a deep link for our app, we can navigate
    if (data.startsWith('mobile://')) {
      const path = data.replace('mobile://', '');
      router.push(path as any);
    } else {
      alert(`Scanned: ${data}`);
      setScanned(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <X color="#fff" size={32} />
          </TouchableOpacity>
          
          <View style={styles.overlay}>
             <View style={styles.unfocusedContainer}></View>
             <View style={styles.middleContainer}>
                <View style={styles.unfocusedContainer}></View>
                <View style={styles.focusedContainer}></View>
                <View style={styles.unfocusedContainer}></View>
             </View>
             <View style={styles.unfocusedContainer}></View>
          </View>
          
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>Scan a QR code on the dustbin</Text>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'column',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  infoText: {
    color: '#fff',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  middleContainer: {
    flexDirection: 'row',
    height: 250,
  },
  focusedContainer: {
    width: 250,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
  },
});
