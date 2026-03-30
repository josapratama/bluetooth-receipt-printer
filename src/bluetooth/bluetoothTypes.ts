export interface BluetoothDevice extends EventTarget {
  id: string;
  name?: string;
  gatt?: BluetoothRemoteGATTServer;
}

export interface BluetoothRemoteGATTServer {
  device: BluetoothDevice;
  connect(): Promise<BluetoothRemoteGATTServer>;
  disconnect(): void;
  connected: boolean;
  getPrimaryService(uuid: string): Promise<BluetoothRemoteGATTService>;
}

export interface BluetoothRemoteGATTService {
  uuid: string;
  getCharacteristic(uuid: string): Promise<BluetoothRemoteGATTCharacteristic>;
  getCharacteristics(): Promise<BluetoothRemoteGATTCharacteristic[]>;
}

export interface BluetoothRemoteGATTCharacteristic {
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

export interface BluetoothRemoteGATTDescriptor {
  uuid: string;
}

export interface BluetoothDeviceExtended extends BluetoothDevice {
  gatt?: BluetoothRemoteGATTServer;
}

export interface RequestDeviceOptions {
  filters: Array<{
    services: string[];
  }>;
}

export interface NavigatorWithBluetooth extends Navigator {
  bluetooth: {
    requestDevice: (
      options: RequestDeviceOptions
    ) => Promise<BluetoothDeviceExtended>;
  };
}
