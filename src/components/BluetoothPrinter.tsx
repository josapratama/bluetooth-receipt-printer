"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BluetoothDeviceExtended,
  NavigatorWithBluetooth,
} from "@/bluetooth/bluetoothTypes";
import {
  connectToDeviceGATT,
  getService,
  getCharacteristic,
  sendDataInChunks,
  getServiceAndCharacteristicUUIDs,
} from "@/utils/bluetoothUtils";
import { generateReceiptContent } from "@/utils/receiptUtils";
import styles from "./BluetoothPrinter.module.css";
const BluetoothPrinter = () => {
  const [device, setDevice] = useState<BluetoothDeviceExtended | null>(null);
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState("Idle");

  const requestBluetoothDevice = async () => {
    try {
      setStatus("Requesting Bluetooth device...");
      const device: BluetoothDeviceExtended = await (
        navigator as NavigatorWithBluetooth
      ).bluetooth.requestDevice({
        filters: [
          {
            services: [
              "000018f0-0000-1000-8000-00805f9b34fb",
              "e7810a71-73ae-499d-8c15-faa9aef0c3f2",
            ],
          },
        ],
      });
      setDevice(device);
      setStatus(`Device selected: ${device.name}`);
    } catch (error) {
      setStatus("Failed to select device: " + error);
    }
  };

  const connectToDevice = async () => {
    if (!device) return;
    try {
      setStatus("Connecting to device...");
      const server = await device.gatt?.connect();
      if (server) {
        setConnected(true);
        setStatus(`Connected to device: ${device.name}`);
      } else {
        setStatus("Failed to connect: gatt server is undefined");
      }
    } catch (error) {
      setStatus("Failed to connect: " + error);
    }
  };

  const sendReceipt = async () => {
    if (!connected || !device?.gatt) {
      setStatus("Device not connected or GATT server unavailable.");
      return;
    }

    try {
      setStatus("Sending receipt to printer...");
      const receiptContent = generateReceiptContent();
      const data = new TextEncoder().encode(receiptContent);
      const { serviceUUID, characteristicUUID } =
        getServiceAndCharacteristicUUIDs();

      const server = await connectToDeviceGATT(device);
      const service = await getService(server, serviceUUID);
      const characteristic = await getCharacteristic(
        service,
        characteristicUUID
      );

      await sendDataInChunks(characteristic, data);

      setStatus("Receipt sent successfully!");
    } catch (error: unknown) {
      setStatus(
        `Failed to send receipt: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const disconnectDevice = useCallback(() => {
    if (device?.gatt?.connected) {
      device.gatt.disconnect();
      setConnected(false);
      setStatus("Device disconnected");
    }
  }, [device]);

  useEffect(() => {
    return () => {
      disconnectDevice();
    };
  }, [disconnectDevice]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Bluetooth Receipt Printer</h1>
      <p className={styles.status}>Status: {status}</p>
      <div className={styles.buttonGroup}>
        <button
          onClick={requestBluetoothDevice}
          className={styles.button}
          disabled={status === "Requesting Bluetooth device..."}
        >
          Select Bluetooth Device
        </button>
        <button
          onClick={connectToDevice}
          className={styles.button}
          disabled={!device || connected}
        >
          Connect
        </button>
        <button
          onClick={sendReceipt}
          className={styles.button}
          disabled={!connected}
        >
          Send Receipt
        </button>
        <button
          onClick={disconnectDevice}
          className={styles.button}
          disabled={!connected}
        >
          Disconnect
        </button>
      </div>

      {device && (
        <div className={styles.deviceInfo}>
          <h2>Selected Device:</h2>
          <p>Name: {device.name ?? "Unknown"}</p>
          <p>ID: {device.id}</p>
          <p>Status: {connected ? "Connected" : "Not Connected"}</p>
        </div>
      )}
    </div>
  );
};

export default BluetoothPrinter;
