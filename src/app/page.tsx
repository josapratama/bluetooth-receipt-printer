// pages/index.tsx
import Head from "next/head";
import BluetoothPrinter from "@/components/BluetoothPrinter";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Bluetooth Receipt Printer</title>
      </Head>

      <main>
        <h1>Welcome to Bluetooth Receipt Printer</h1>
        <BluetoothPrinter />
      </main>
    </div>
  );
}
