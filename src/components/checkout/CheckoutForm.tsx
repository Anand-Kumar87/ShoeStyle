'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { ShippingAddress } from '@/types/order';
import { validateEmail, validatePhone, validateZipCode } from '@/utils/validation';

// 🔥 Global list of all countries
const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe"
];

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
              className="block w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
            >
              <option value="">Select a country</option>
              {/* 🔥 Auto-generating options from the array */}
              {COUNTRIES.map((countryName) => (
                <option key={countryName} value={countryName}>
                  {countryName}
                </option>
              ))}
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
