export const generateReceiptContent = () => {
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
