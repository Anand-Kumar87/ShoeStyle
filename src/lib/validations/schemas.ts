import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().optional(),
      id: z.string().optional(),
      name: z.string(),
      price: z.number().positive(),
      quantity: z.number().int().positive(),
      size: z.string().optional().nullable(),
      color: z.string().optional().nullable(),
      image: z.string().optional().nullable(),
    })
  ).min(1, 'Order must contain at least one item'),
  shippingAddress: z.object({
    name: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    street: z.string().optional(),
    apartment: z.string().optional().nullable(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional().default('IN'),
  }),
  couponCode: z.string().optional().nullable(),
});

export const couponValidateSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
  orderAmount: z.number().nonnegative('Order amount must be 0 or positive'),
  email: z.string().email().optional().nullable(),
});

export const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional().nullable(),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});
