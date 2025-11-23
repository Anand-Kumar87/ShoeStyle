'use client';

import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';

interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiresAt: Date;
  usageCount: number;
  usageLimit: number;
}

const CouponManager: React.FC = () => {
  const [coupons] = useState<Coupon[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Coupon Management</h1>
        <Button leftIcon={<Plus className="h-5 w-5" />} onClick={() => setIsModalOpen(true)}>
          Add Coupon
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="rounded-lg border border-neutral-200 bg-white p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">{coupon.code}</h3>
                <p className="mt-1 text-sm text-neutral-600">
                  {coupon.discountType === 'percentage'
                    ? `${coupon.discountValue}% off`
                    : `$${coupon.discountValue} off`}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="text-blue-600 hover:text-blue-900">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="text-red-600 hover:text-red-900">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2 text-sm text-neutral-600">
              <div className="flex justify-between">
                <span>Used:</span>
                <span className="font-medium">
                  {coupon.usageCount} / {coupon.usageLimit}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Expires:</span>
                <span className="font-medium">{coupon.expiresAt.toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Coupon"
        size="md"
      >
        <div className="space-y-4">
          <Input label="Coupon Code" placeholder="SAVE20" fullWidth />
          <Input label="Discount Value" type="number" placeholder="20" fullWidth />
          <Input label="Usage Limit" type="number" placeholder="100" fullWidth />
          <Button fullWidth>Create Coupon</Button>
        </div>
      </Modal>
    </div>
  );
};

export default CouponManager;