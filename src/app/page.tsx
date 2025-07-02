'use client';

import { useState } from 'react';
import Image from 'next/image';

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

  const fetchProduct = async (code: string, type: 'upc' | 'isbn') => {
    setLoading(true);
    setError(null);
    setProduct(null);

    try {
      const res = await fetch(`/api/${type}-lookup?code=${code}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setProduct(data);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Buscar producto</h1>

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
    </div>
  );
}
