'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { ShippingAddress } from '@/types/order';
import { validateEmail, validatePhone, validateZipCode } from '@/utils/validation';

interface CheckoutFormProps {
  onSubmit: (data: ShippingAddress) => void;
  isLoading?: boolean;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingAddress>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Contact Information */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">Contact Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="First Name"
            {...register('firstName', { required: 'First name is required' })}
            error={errors.firstName?.message}
            fullWidth
          />
          <Input
            label="Last Name"
            {...register('lastName', { required: 'Last name is required' })}
            error={errors.lastName?.message}
            fullWidth
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input
            label="Email"
            type="email"
            {...register('email', {
              required: 'Email is required',
              validate: (value) => validateEmail(value) || 'Invalid email address',
            })}
            error={errors.email?.message}
            fullWidth
          />
          <Input
            label="Phone"
            type="tel"
            {...register('phone', {
              required: 'Phone is required',
              validate: (value) => validatePhone(value) || 'Invalid phone number',
            })}
            error={errors.phone?.message}
            fullWidth
          />
        </div>
      </div>

      {/* Shipping Address */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">Shipping Address</h3>
        <div className="space-y-4">
          <Input
            label="Address"
            {...register('address', { required: 'Address is required' })}
            error={errors.address?.message}
            fullWidth
          />
          <Input
            label="Apartment, suite, etc. (optional)"
            {...register('apartment')}
            fullWidth
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="City"
              {...register('city', { required: 'City is required' })}
              error={errors.city?.message}
              fullWidth
            />
            <Input
              label="State"
              {...register('state', { required: 'State is required' })}
              error={errors.state?.message}
              fullWidth
            />
            <Input
              label="ZIP Code"
              {...register('zipCode', {
                required: 'ZIP code is required',
                validate: (value) => validateZipCode(value) || 'Invalid ZIP code',
              })}
              error={errors.zipCode?.message}
              fullWidth
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-900">
              Country
            </label>
            <select
              {...register('country', { required: 'Country is required' })}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <option value="">Select a country</option>
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="UK">United Kingdom</option>
              <option value="AU">Australia</option>
            </select>
            {errors.country && (
              <p className="mt-1.5 text-sm text-red-600">{errors.country.message}</p>
            )}
          </div>
        </div>
      </div>

      <Button type="submit" isLoading={isLoading} size="lg" fullWidth>
        Continue to Payment
      </Button>
    </form>
  );
};

export default CheckoutForm;