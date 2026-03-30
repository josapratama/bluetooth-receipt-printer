import {
  BluetoothRemoteGATTCharacteristic,
  BluetoothRemoteGATTServer,
  BluetoothRemoteGATTService,
  BluetoothDeviceExtended,
} from "@/bluetooth/bluetoothTypes";

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getServiceAndCharacteristicUUIDs = () => {
  return {
    serviceUUID: "000018f0-0000-1000-8000-00805f9b34fb",
    characteristicUUID: "00002af1-0000-1000-8000-00805f9b34fb",
  };
};

export const connectToDeviceGATT = async (device: BluetoothDeviceExtended) => {
  if (!device?.gatt) {
    throw new Error("Device or GATT server is not available.");
  }

  const server = await device.gatt.connect();
  if (!server) {
    throw new Error("GATT server connection failed.");
  }

  return server;
};

export const getService = async (
  server: BluetoothRemoteGATTServer,
  serviceUUID: string
) => {
  const service = await server.getPrimaryService(serviceUUID);
  if (!service) {
    throw new Error("Service not found.");
  }
  return service;
};

export const getCharacteristic = async (
  service: BluetoothRemoteGATTService,
  characteristicUUID: string
) => {
  const characteristic = await service.getCharacteristic(characteristicUUID);
  if (!characteristic) {
    throw new Error("Characteristic not found.");
  }
  return characteristic;
};

export const sendDataInChunks = async (
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
    await delay(100);
  }
};
