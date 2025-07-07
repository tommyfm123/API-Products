'use client';
import 'dotenv/config'; // si usás fuera de Next.js

import { useState } from 'react';
import Image from 'next/image';
import BarcodeScanner from '@/components/BarcodeScanner';

type Product = {
  title: string;
  brand: string;
  description: string;
  image: string | null;
};

export default function UPCProductLookup() {
  const [upc, setUpc] = useState('');
  const [isbn, setIsbn] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scannedProducts, setScannedProducts] = useState<Product[]>([]);

  const fetchProduct = async (code: string, type: 'upc' | 'isbn') => {
    setLoading(true);
    setError(null);
    setProduct(null);

    try {
      const res = await fetch(`/api/${type}-lookup?code=${code}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setProduct(data);
      return data as Product;
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleDetected = async (code: string) => {
    const prod = await fetchProduct(code, 'upc');
    if (prod) {
      setScannedProducts((prev) => [...prev, prod]);
    }
    setScanning(false);
  };

  const updateScanned = (idx: number, newProd: Product) => {
    setScannedProducts((prev) => prev.map((p, i) => (i === idx ? newProd : p)));
  };

  const deleteScanned = (idx: number) => {
    setScannedProducts((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Buscar producto</h1>
      <h3>Producto de prueba</h3>
      <p>airpods pro: 195949704529</p>
      <p>cuerdas: 749699121480</p>
      <p>airpods 1: 888462858427</p>
      <p>macbook: 1 9425204898 6</p>
      <p>Libro: 9781781257654</p>
      <p>The Pragmatic Programmer: 9780135957059</p>

      {/* Buscar por UPC */}
      <form onSubmit={(e) => { e.preventDefault(); fetchProduct(upc, 'upc'); }} className="space-y-2">
        <label className="block font-medium">Buscar por UPC</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={upc}
            onChange={(e) => setUpc(e.target.value)}
            placeholder="Ej: 190198496807"
            className="flex-1 border border-gray-300 rounded px-2 py-1"
            required
          />
          <button type="submit" className="bg-black text-white px-4 py-1 rounded hover:bg-gray-800">
            Buscar
          </button>
        </div>
      </form>

      <button
        type="button"
        onClick={() => setScanning(true)}
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
      >
        Escanear código
      </button>

      {scanning && (
        <BarcodeScanner onDetected={handleDetected} onClose={() => setScanning(false)} />
      )}

      {/* Buscar por ISBN */}
      <form onSubmit={(e) => { e.preventDefault(); fetchProduct(isbn, 'isbn'); }} className="space-y-2">
        <label className="block font-medium">Buscar por ISBN (libros)</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            placeholder="Ej: 9783161484100"
            className="flex-1 border border-gray-300 rounded px-2 py-1"
            required
          />
          <button type="submit" className="bg-black text-white px-4 py-1 rounded hover:bg-gray-800">
            Buscar
          </button>
        </div>
      </form>

      {/* Resultado */}
      {loading && <p>Buscando...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
      {product && (
        <div className="border rounded p-4 shadow">
          <h2 className="text-xl font-semibold mb-2">{product.title}</h2>
          {product.image && (
            <div className="relative w-full h-64 mb-2 rounded overflow-hidden">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-contain"
              />
            </div>
          )}
          <p><strong>Marca:</strong> {product.brand}</p>
          <p><strong>Descripción:</strong> {product.description || 'No disponible'}</p>
        </div>
      )}

      {scannedProducts.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Productos escaneados</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1">Nombre</th>
                  <th className="border px-2 py-1">Descripción</th>
                  <th className="border px-2 py-1 w-20">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {scannedProducts.map((p, i) => (
                  <tr key={i} className="odd:bg-gray-50">
                    <td className="border px-2 py-1">
                      <input
                        className="w-full border rounded-md px-2 py-1"
                        value={p.title}
                        onChange={(e) => updateScanned(i, { ...p, title: e.target.value })}
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        className="w-full border rounded-md px-2 py-1"
                        value={p.description}
                        onChange={(e) => updateScanned(i, { ...p, description: e.target.value })}
                      />
                    </td>
                    <td className="border px-2 py-1 text-center">
                      <button
                        type="button"
                        onClick={() => deleteScanned(i)}
                        className="text-red-600 hover:underline"
                      >
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}