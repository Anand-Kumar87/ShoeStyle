'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { validateEmail, validatePhone, validateZipCode } from '@/utils/validation';
import { COUNTRIES, getCountryByCode, ShippingCalculationResult } from '@/data/countries';
import { useGlobalCurrency } from '@/context/CurrencyContext';
import { Truck, Zap, ShieldCheck, Globe2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export interface ShippingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface CheckoutFormProps {
  onSubmit: (data: ShippingFormData) => void;
  isLoading?: boolean;
  selectedCountry: string;
  onCountryChange: (countryCode: string) => void;
  shippingMethod: 'standard' | 'express';
  onShippingMethodChange: (method: 'standard' | 'express') => void;
  shippingResult: ShippingCalculationResult;
  standardFeeInr: number;
  expressFeeInr: number;
  onPincodeChange?: (pincode: string) => void;
  initialValues?: Partial<ShippingFormData>;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  onSubmit,
  isLoading,
  selectedCountry,
  onCountryChange,
  shippingMethod,
  onShippingMethodChange,
  shippingResult,
  standardFeeInr,
  expressFeeInr,
  onPincodeChange,
  initialValues,
}) => {
  const { convertPrice, loading: currencyLoading, freeShippingThreshold } = useGlobalCurrency();
  const currentCountry = getCountryByCode(selectedCountry);

  const [pinVerification, setPinVerification] = useState<{
    loading: boolean;
    valid?: boolean;
    message?: string;
    district?: string;
    state?: string;
  }>({ loading: false });

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ShippingFormData>({
    defaultValues: {
      country: selectedCountry || 'IN',
      firstName: initialValues?.firstName || '',
      lastName: initialValues?.lastName || '',
      email: initialValues?.email || '',
      phone: initialValues?.phone || '',
      ...initialValues,
    },
  });

  React.useEffect(() => {
    if (initialValues) {
      if (initialValues.firstName && !getValues('firstName')) setValue('firstName', initialValues.firstName);
      if (initialValues.lastName && !getValues('lastName')) setValue('lastName', initialValues.lastName);
      if (initialValues.email && !getValues('email')) setValue('email', initialValues.email);
      if (initialValues.phone && !getValues('phone')) setValue('phone', initialValues.phone);
    }
  }, [initialValues]);

  const verifyPinCode = async (pinValue: string) => {
    const trimmed = pinValue.trim();
    if (!trimmed) return;

    if (selectedCountry === 'IN') {
      if (!/^[1-9][0-9]{5}$/.test(trimmed)) {
        setPinVerification({
          loading: false,
          valid: false,
          message: 'Indian PIN code must be 6 digits (e.g. 271313, 110001)',
        });
        return;
      }

      setPinVerification({ loading: true });
      try {
        const res = await fetch(`/api/pincode/lookup?pincode=${encodeURIComponent(trimmed)}&country=IN`);
        const data = await res.json();

        if (data.valid) {
          clearErrors('zipCode');
          setPinVerification({
            loading: false,
            valid: true,
            message: data.message || `Verified: ${data.state}`,
            district: data.district,
            state: data.state,
          });

          // Auto-fill City if empty
          if (data.district) {
            const currentCity = getValues('city');
            if (!currentCity || currentCity.trim() === '') {
              setValue('city', data.district, { shouldValidate: true });
            }
          }

          // Auto-fill State if empty
          if (data.state) {
            const currentState = getValues('state');
            if (!currentState || currentState.trim() === '') {
              setValue('state', data.state, { shouldValidate: true });
            }
          }

          // Trigger live courier calculation
          onPincodeChange?.(trimmed);
        } else {
          setPinVerification({
            loading: false,
            valid: false,
            message: data.message || 'Invalid Indian PIN code',
          });
          setError('zipCode', {
            type: 'manual',
            message: data.message || 'Invalid Indian PIN code',
          });
        }
      } catch (err) {
        setPinVerification({
          loading: false,
          valid: true,
          message: 'Valid PIN format',
        });
        onPincodeChange?.(trimmed);
      }
    } else {
      const isValid = validateZipCode(trimmed, selectedCountry);
      if (isValid) {
        clearErrors('zipCode');
        setPinVerification({
          loading: false,
          valid: true,
          message: 'Valid postal code',
        });
        onPincodeChange?.(trimmed);
      } else {
        setPinVerification({
          loading: false,
          valid: false,
          message: 'Invalid postal code format',
        });
      }
    }
  };

  const handleCountrySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setValue('country', code);
    setPinVerification({ loading: false });
    clearErrors('zipCode');
    onCountryChange(code);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8 w-full max-w-full min-w-0 overflow-hidden box-border">
      {/* 1. Contact Information */}
      <div className="w-full min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
          <h3 className="text-sm sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>👤</span> Contact Information
          </h3>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Step 1 of 2
          </span>
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 w-full min-w-0">
          <Input
            label="First Name"
            placeholder="e.g. Rahul"
            {...register('firstName', { required: 'First name is required' })}
            error={errors.firstName?.message}
            fullWidth
          />
          <Input
            label="Last Name"
            placeholder="e.g. Sharma"
            {...register('lastName', { required: 'Last name is required' })}
            error={errors.lastName?.message}
            fullWidth
          />
        </div>

        <div className="mt-3 sm:mt-4 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 w-full min-w-0">
          <Input
            label="Email Address"
            type="email"
            placeholder="rahul@example.com"
            {...register('email', {
              required: 'Email is required',
              validate: (value) => validateEmail(value) || 'Invalid email address',
            })}
            error={errors.email?.message}
            fullWidth
          />
          <div className="w-full min-w-0">
            <Input
              label={`Phone Number (${currentCountry.dialCode})`}
              type="tel"
              placeholder="9876543210"
              {...register('phone', {
                required: 'Phone is required',
                validate: (value) => validatePhone(value) || 'Invalid phone number',
              })}
              error={errors.phone?.message}
              fullWidth
            />
            <p className="mt-1 text-[11px] text-slate-400 font-medium">
              We will send order confirmation and tracking SMS here
            </p>
          </div>
        </div>
      </div>

      {/* 2. Shipping Address */}
      <div className="border-t border-slate-100 pt-5 sm:pt-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
          <h3 className="text-sm sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>📍</span> Shipping Address
          </h3>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-slate-100 text-slate-700">
            <Globe2 size={12} /> {COUNTRIES.length}+ Countries Available
          </span>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {/* Country Selector (Worldwide) */}
          <div>
            <label className="mb-1.5 block text-xs sm:text-sm font-bold text-slate-700">
              Destination Country / Region <span className="text-red-500">*</span>
            </label>
            <div className="relative w-full max-w-full">
              <select
                value={selectedCountry}
                onChange={handleCountrySelect}
                className="block w-full max-w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-3 text-xs sm:text-sm font-semibold text-slate-900 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all shadow-sm cursor-pointer truncate"
              >
                <optgroup label="Priority Destinations">
                  <option value="IN">🇮🇳 India (Domestic Delivery & COD)</option>
                  <option value="US">🇺🇸 United States</option>
                  <option value="GB">🇬🇧 United Kingdom</option>
                  <option value="AE">🇦🇪 United Arab Emirates</option>
                  <option value="CA">🇨🇦 Canada</option>
                  <option value="AU">🇦🇺 Australia</option>
                </optgroup>
                <optgroup label="All Global Worldwide Destinations">
                  {COUNTRIES.filter(c => !['IN', 'US', 'GB', 'AE', 'CA', 'AU'].includes(c.code)).map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name} ({c.code})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500 font-medium">
              {currentCountry.zone === 'DOMESTIC'
                ? `🚀 Shipping within India: Free on orders over ₹${freeShippingThreshold}. Express delivery available.`
                : `✈️ International tracked delivery to ${currentCountry.name}. Express customs cleared.`}
            </p>
          </div>

          <Input
            label="Street Address"
            placeholder="Flat / House No., Building, Street name"
            {...register('address', { required: 'Street address is required' })}
            error={errors.address?.message}
            fullWidth
          />

          <Input
            label="Apartment, suite, landmark (optional)"
            placeholder="e.g. Near City Center Mall"
            {...register('apartment')}
            fullWidth
          />

          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3 w-full min-w-0">
            <div className="w-full min-w-0">
              <Input
                label="City"
                placeholder="e.g. Gonda"
                {...register('city', { required: 'City is required' })}
                error={errors.city?.message}
                fullWidth
              />
            </div>
            <div className="w-full min-w-0">
              <Input
                label="State / Province"
                placeholder="e.g. Uttar Pradesh"
                {...register('state', { required: 'State is required' })}
                error={errors.state?.message}
                fullWidth
              />
            </div>

            {/* PIN / Postal Code with Live Address Verification */}
            <div className="w-full min-w-0">
              <Input
                label={selectedCountry === 'IN' ? 'PIN Code (6 digits)' : 'PIN / Postal Code'}
                placeholder={selectedCountry === 'IN' ? 'e.g. 271313' : 'e.g. 10001'}
                {...register('zipCode', {
                  required: selectedCountry === 'IN' ? '6-digit PIN code is required' : 'PIN / Postal code is required',
                  validate: (value) => {
                    const valid = validateZipCode(value, selectedCountry);
                    if (!valid) {
                      return selectedCountry === 'IN'
                        ? 'Enter a valid 6-digit Indian PIN Code (e.g. 271313)'
                        : 'Invalid postal code format';
                    }
                    if (pinVerification.valid === false) {
                      return pinVerification.message || 'Invalid PIN code';
                    }
                    return true;
                  },
                })}
                onChange={(e) => {
                  setValue('zipCode', e.target.value);
                  const clean = e.target.value.trim();
                  if (selectedCountry === 'IN' && clean.length === 6) {
                    verifyPinCode(clean);
                  } else if (clean.length < 6 && selectedCountry === 'IN') {
                    setPinVerification({ loading: false });
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value) {
                    verifyPinCode(e.target.value);
                  }
                }}
                error={errors.zipCode?.message}
                fullWidth
              />

              {/* PIN Code Verification Indicator */}
              {pinVerification.loading && (
                <p className="mt-1.5 text-[11px] font-bold text-blue-600 flex items-center gap-1.5">
                  <Loader2 size={12} className="animate-spin" /> Verifying postal circle...
                </p>
              )}
              {!pinVerification.loading && pinVerification.valid && (
                <p className="mt-1.5 text-[11px] font-bold text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  <span>{pinVerification.message}</span>
                </p>
              )}
              {!pinVerification.loading && pinVerification.valid === false && (
                <p className="mt-1.5 text-[11px] font-bold text-red-500 flex items-center gap-1.5">
                  <AlertCircle size={13} />
                  <span>{pinVerification.message}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Shipping Method Selector */}
      <div className="border-t border-slate-100 pt-5 w-full min-w-0">
        <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2 mb-3">
          <span>🚚</span> Choose Delivery Method
        </h3>

        <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2 w-full min-w-0">
          {/* Standard Shipping Card */}
          <div
            onClick={() => onShippingMethodChange('standard')}
            className={`relative p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer ${
              shippingMethod === 'standard'
                ? 'border-slate-900 bg-slate-50/70 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                    shippingMethod === 'standard'
                      ? 'border-slate-900 bg-slate-900'
                      : 'border-slate-300'
                  }`}
                >
                  {shippingMethod === 'standard' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5 truncate">
                    <Truck size={14} className="flex-shrink-0" /> Standard Delivery
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-semibold mt-0.5 truncate">
                    {currentCountry.zone === 'DOMESTIC' ? '2-4 Business Days' : '5-8 Business Days'}
                  </p>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                {standardFeeInr === 0 ? (
                  <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs font-black tracking-wide uppercase">
                    FREE
                  </span>
                ) : (
                  <span className="text-xs sm:text-sm font-black text-slate-900">
                    {currencyLoading ? '...' : convertPrice(standardFeeInr)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Express Priority Air Card */}
          <div
            onClick={() => onShippingMethodChange('express')}
            className={`relative p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer ${
              shippingMethod === 'express'
                ? 'border-slate-900 bg-slate-50/70 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                    shippingMethod === 'express'
                      ? 'border-slate-900 bg-slate-900'
                      : 'border-slate-300'
                  }`}
                >
                  {shippingMethod === 'express' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5 truncate">
                    <Zap size={14} className="text-amber-500 flex-shrink-0" /> Priority Air Express
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-semibold mt-0.5 truncate">
                    {currentCountry.zone === 'DOMESTIC' ? '1-2 Days Express' : '3-5 Days DHL / FedEx'}
                  </p>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-xs sm:text-sm font-black text-slate-900">
                  {currencyLoading ? '...' : convertPrice(expressFeeInr)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Trust Badges & Submit Button */}
      <div className="pt-2 space-y-3">
        <Button
          type="submit"
          isLoading={isLoading}
          size="lg"
          fullWidth
          className="bg-slate-900 hover:bg-black text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black uppercase tracking-wider shadow-lg active:scale-[0.99] transition-all text-xs sm:text-sm cursor-pointer"
        >
          {isLoading ? 'Processing Order...' : 'Continue to Payment →'}
        </Button>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 pt-1 text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <ShieldCheck size={13} className="text-emerald-500" /> 256-Bit SSL Encrypted
          </span>
          <span>•</span>
          <span>100% Authentic Products</span>
          <span>•</span>
          <span>Easy Returns</span>
        </div>
      </div>
    </form>
  );
};

export default CheckoutForm;