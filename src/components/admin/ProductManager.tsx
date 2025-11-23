'use client';

import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import { Product } from '@/types/product';

const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <Button leftIcon={<Plus className="h-5 w-5" />} onClick={() => setIsModalOpen(true)}>
          Add Product
        </Button>
      </div>

      {/* Search */}
      <Input
        leftIcon={<Search className="h-5 w-5" />}
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        fullWidth
      />

      {/* Products Table */}
      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 bg-white">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-neutral-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                        {/* Product image placeholder */}
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900">{product.name}</div>
                        <div className="text-sm text-neutral-500">{product.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-900">
                    {product.category}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-900">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-900">
                    {product.stock}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        product.stock > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <button className="mr-3 text-blue-600 hover:text-blue-900">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Product"
        size="lg"
      >
        <div className="space-y-4">
          <Input label="Product Name" placeholder="Enter product name" fullWidth />
          <Input label="Price" type="number" placeholder="0.00" fullWidth />
          <Input label="Stock" type="number" placeholder="0" fullWidth />
          {/* Add more form fields */}
        </div>
      </Modal>
    </div>
  );
};

export default ProductManager;