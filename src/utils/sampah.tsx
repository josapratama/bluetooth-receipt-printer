"use client";

import { useState, useEffect, useCallback } from "react";

// Definisi tipe Bluetooth API
interface BluetoothDevice extends EventTarget {
  id: string;
  name?: string;
  gatt?: BluetoothRemoteGATTServer;
}

interface BluetoothRemoteGATTServer {
  device: BluetoothDevice;
  connect(): Promise<BluetoothRemoteGATTServer>;
  disconnect(): void;
  connected: boolean;
  getPrimaryService(uuid: string): Promise<BluetoothRemoteGATTService>;
}

interface BluetoothRemoteGATTService {
  uuid: string;
  getCharacteristic(uuid: string): Promise<BluetoothRemoteGATTCharacteristic>;
  getCharacteristics(): Promise<BluetoothRemoteGATTCharacteristic[]>;
}

interface BluetoothRemoteGATTCharacteristic {
  uuid: string;
  writeValue(value: Uint8Array): Promise<void>;
  getDescriptors(): Promise<BluetoothRemoteGATTDescriptor[]>;
  properties: {
    read: boolean;
    write: boolean;
    notify: boolean;
    writeWithoutResponse?: boolean;
  };
  writeValueWithoutResponse?(value: Uint8Array): Promise<void>;
}

interface BluetoothRemoteGATTDescriptor {
  uuid: string;
}

interface BluetoothDeviceExtended extends BluetoothDevice {
  gatt?: BluetoothRemoteGATTServer;
}

interface RequestDeviceOptions {
  filters: Array<{
    services: string[];
  }>;
}

interface NavigatorWithBluetooth extends Navigator {
  bluetooth: {
    requestDevice: (
      options: RequestDeviceOptions
    ) => Promise<BluetoothDeviceExtended>;
  };
}

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
              "000018f0-0000-1000-8000-00805f9b34fb", // GATT service UUID
              "e7810a71-73ae-499d-8c15-faa9aef0c3f2", // Optional second service UUID
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
        await discoverServicesAndCharacteristics(); // Panggil fungsi setelah terhubung
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

      const server = await connectToDeviceGATT();
      const service = await getService(server, serviceUUID);
      const characteristic = await getCharacteristic(
        service,
        characteristicUUID
      );

      await sendDataInChunks(characteristic, data);

      setStatus("Receipt sent successfully!");
    } catch (error: unknown) {
      handleError(error);
    }
  };

  const generateReceiptContent = () => {
    return `
      ==================================
              INDOMARET/ALFAMART
         Jl. Contoh Alamat No. 123, Jakarta
          Telp: (021) 12345678
      ==================================
  
          Struk Pembelian
  
      Barang        Qty     Harga
      ---------------------------
      Produk A      2       Rp 10,000
      Produk B      1       Rp 20,000
      ---------------------------
      Total                 Rp 50,000
      ==================================
  
      Terima Kasih telah berbelanja
      di INDOMARET/ALFAMART
  
      Tanggal: ${new Date().toLocaleDateString()}
      ==================================
    `;
  };

  const getServiceAndCharacteristicUUIDs = () => {
    return {
      serviceUUID: "000018f0-0000-1000-8000-00805f9b34fb",
      characteristicUUID: "00002af1-0000-1000-8000-00805f9b34fb",
    };
  };

  const connectToDeviceGATT = async () => {
    if (!device || !device.gatt) {
      throw new Error("Device or GATT server is not available.");
    }

    const server = await device.gatt.connect();
    if (!server) {
      throw new Error("GATT server connection failed.");
    }

    return server;
  };

  const getService = async (
    server: BluetoothRemoteGATTServer,
    serviceUUID: string
  ) => {
    const service = await server.getPrimaryService(serviceUUID);
    if (!service) {
      throw new Error("Service not found.");
    }
    return service;
  };

  const getCharacteristic = async (
    service: BluetoothRemoteGATTService,
    characteristicUUID: string
  ) => {
    const characteristic = await service.getCharacteristic(characteristicUUID);
    if (!characteristic) {
      throw new Error("Characteristic not found.");
    }
    return characteristic;
  };

  const sendDataInChunks = async (
    characteristic: BluetoothRemoteGATTCharacteristic,
    data: Uint8Array
  ) => {
    const maxChunkSize = 128; // Reduced chunk size
    const writeMethod = characteristic.writeValueWithoutResponse
      ? characteristic.writeValueWithoutResponse
      : characteristic.writeValue;

    for (let i = 0; i < data.length; i += maxChunkSize) {
      const chunk = data.slice(i, i + maxChunkSize);
      console.log("Sending data chunk:", chunk);
      await writeMethod.call(characteristic, chunk);
      await delay(100); // Wait for 100ms before sending the next chunk
    }
  };

  const handleError = (error: unknown) => {
    if (error instanceof Error) {
      setStatus(`Failed to send receipt: ${error.message}`);
    } else {
      setStatus("Failed to send receipt: Unknown error occurred.");
    }
  };

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const disconnectDevice = useCallback(() => {
    if (device?.gatt?.connected) {
      device.gatt.disconnect();
      setConnected(false);
      setStatus("Device disconnected");
    }
  }, [device]);

  const discoverServicesAndCharacteristics = async () => {
    if (!connected || !device?.gatt) return;
    try {
      setStatus("Discovering services and characteristics...");
      const server = await device.gatt.connect();
      const serviceUUID = "000018f0-0000-1000-8000-00805f9b34fb";
      const service = await server.getPrimaryService(serviceUUID); // Menggunakan getPrimaryService
      const characteristics = await service.getCharacteristics();

      for (const characteristic of characteristics) {
        console.log(`Characteristic: ${characteristic.uuid}`);
        console.log(`Properties:`, characteristic.properties);

        const descriptors = await characteristic.getDescriptors();
        console.log(
          `Descriptors for characteristic ${characteristic.uuid}:`,
          descriptors
        );
      }
      setStatus(
        "Discovery complete. Check the console for services and characteristics."
      );
    } catch (error) {
      setStatus("Failed to discover services/characteristics: " + error);
    }
  };

  useEffect(() => {
    return () => {
      disconnectDevice();
    };
  }, [disconnectDevice]);

  return (
    <div>
      <h1>Bluetooth Receipt Printer</h1>
      <p>Status: {status}</p>
      <div style={{ marginBottom: "20px" }}>
        <button onClick={requestBluetoothDevice}>
          Select Bluetooth Device
        </button>
        <button onClick={connectToDevice} disabled={!device || connected}>
          Connect
        </button>
        <button onClick={sendReceipt} disabled={!connected}>
          Send Receipt
        </button>
        <button onClick={disconnectDevice} disabled={!connected}>
          Disconnect
        </button>
        <button
          onClick={discoverServicesAndCharacteristics}
          disabled={!connected}
        >
          Discover Services & Characteristics
        </button>
      </div>

      {device && (
        <div>
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
