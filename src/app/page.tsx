'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { Spinner } from '@/components/ui/Spinner';

type ApiProduct = {
  nombre: string;
  imagen: string;
  descripcion: string;
};

interface Product extends ApiProduct {
  id: string;
  precio: string;
  stock: string;
}

export default function Home() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiProduct, setApiProduct] = useState<ApiProduct | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');

  async function buscarProducto() {
    if (!code) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/producto?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      setApiProduct(data);
      setPrecio('');
      setStock('');
      setModalOpen(true);
    } catch (err) {
      console.error(err);
      alert('Error al buscar');
    } finally {
      setLoading(false);
    }
  }

  function agregarProducto() {
    if (!apiProduct) return;
    const nuevo: Product = {
      id: crypto.randomUUID(),
      nombre: apiProduct.nombre,
      imagen: apiProduct.imagen,
      descripcion: apiProduct.descripcion,
      precio,
      stock,
    };
    setProducts((prev) => [...prev, nuevo]);
    setModalOpen(false);
  }

  function eliminar(id: string) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  function editar(prod: Product) {
    setApiProduct({ nombre: prod.nombre, imagen: prod.imagen, descripcion: prod.descripcion });
    setPrecio(prod.precio);
    setStock(prod.stock);
    eliminar(prod.id);
    setModalOpen(true);
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Buscar producto por código</h1>
      <div className="flex gap-2">
        <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="EAN o UPC" />
        <Button onClick={buscarProducto} disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2"><Spinner /> Buscando...</span>
          ) : (
            'Buscar'
          )}
        </Button>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        {apiProduct && (
          <div className="space-y-4">
            <div>
              <Label className="block mb-1">Nombre</Label>
              <Input value={apiProduct.nombre} onChange={(e) => setApiProduct({ ...apiProduct, nombre: e.target.value })} />
            </div>
            {apiProduct.imagen && (
              <img src={apiProduct.imagen} alt={apiProduct.nombre} className="w-full h-40 object-contain" />
            )}
            <div>
              <Label className="block mb-1">Descripción</Label>
              <Textarea rows={4} value={apiProduct.descripcion} onChange={(e) => setApiProduct({ ...apiProduct, descripcion: e.target.value })} />
            </div>
            <div>
              <Label className="block mb-1">Precio por unidad</Label>
              <Input value={precio} onChange={(e) => setPrecio(e.target.value)} />
            </div>
            <div>
              <Label className="block mb-1">Stock</Label>
              <Input value={stock} onChange={(e) => setStock(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={agregarProducto}>Agregar producto</Button>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            </div>
          </div>
        )}
      </Modal>

      <div className="overflow-x-auto border rounded-md">
        {products.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-indigo-50 text-indigo-700">
              <tr>
                <th className="border px-2 py-1">Nombre</th>
                <th className="border px-2 py-1">Descripción</th>
                <th className="border px-2 py-1">Precio</th>
                <th className="border px-2 py-1">Stock</th>
                <th className="border px-2 py-1 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="odd:bg-gray-50">
                  <td className="border px-2 py-1">{p.nombre}</td>
                  <td className="border px-2 py-1 whitespace-pre-wrap">{p.descripcion}</td>
                  <td className="border px-2 py-1">{p.precio}</td>
                  <td className="border px-2 py-1">{p.stock}</td>
                  <td className="border px-2 py-1 text-center">
                    <DropdownMenu trigger={<span className="cursor-pointer">⋮</span>}>
                      <button className="block w-full text-left px-2 py-1 hover:bg-gray-100" onClick={() => editar(p)}>Editar</button>
                      <button className="block w-full text-left px-2 py-1 hover:bg-gray-100" onClick={() => eliminar(p.id)}>Eliminar</button>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-4 text-center text-gray-500">No se encontraron productos. Por favor, cargá productos.</div>
        )}
      </div>
    </div>
  );
}
