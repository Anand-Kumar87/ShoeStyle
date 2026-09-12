import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { reportServerError } from '@/lib/telemetry';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user?.email) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid address ID' });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User account not found' });
    }

    // Verify ownership
    const existing = await prisma.userAddress.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Address not found or unauthorized' });
    }

    // ==========================================
    // PUT: Update address
    // ==========================================
    if (req.method === 'PUT') {
      const {
        name,
        firstName,
        lastName,
        street,
        apartment,
        city,
        state,
        zip,
        zipCode,
        country,
        phone,
        type,
        isDefault,
      } = req.body;

      let fName = firstName;
      let lName = lastName;
      if (!fName && name) {
        const parts = name.trim().split(/\s+/);
        fName = parts[0] || 'Resident';
        lName = parts.slice(1).join(' ') || '';
      }

      if (isDefault) {
        await prisma.userAddress.updateMany({
          where: { userId: user.id },
          data: { isDefault: false },
        });
      }

      const updated = await prisma.userAddress.update({
        where: { id },
        data: {
          firstName: fName || existing.firstName,
          lastName: lName !== undefined ? lName : existing.lastName,
          street: street ? street.trim() : existing.street,
          apartment: apartment !== undefined ? (apartment ? apartment.trim() : null) : existing.apartment,
          city: city ? city.trim() : existing.city,
          state: state ? state.trim() : existing.state,
          zipCode: zipCode || zip ? (zipCode || zip).trim() : existing.zipCode,
          country: country ? country.trim() : existing.country,
          phone: phone ? phone.trim() : existing.phone,
          type: type || existing.type,
          isDefault: isDefault !== undefined ? Boolean(isDefault) : existing.isDefault,
        },
      });

      return res.status(200).json({
        id: updated.id,
        name: `${updated.firstName} ${updated.lastName}`.trim() || 'Resident',
        firstName: updated.firstName,
        lastName: updated.lastName,
        street: updated.street,
        apartment: updated.apartment || '',
        city: updated.city,
        state: updated.state,
        zip: updated.zipCode,
        zipCode: updated.zipCode,
        country: updated.country,
        phone: updated.phone,
        type: updated.type,
        isDefault: updated.isDefault,
      });
    }

    // ==========================================
    // DELETE: Delete address
    // ==========================================
    if (req.method === 'DELETE') {
      await prisma.userAddress.delete({
        where: { id },
      });

      // If the deleted address was default, set the latest remaining as default
      if (existing.isDefault) {
        const nextDefault = await prisma.userAddress.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
        });
        if (nextDefault) {
          await prisma.userAddress.update({
            where: { id: nextDefault.id },
            data: { isDefault: true },
          });
        }
      }

      return res.status(200).json({ success: true, message: 'Address removed successfully' });
    }

    // ==========================================
    // PATCH: Set as default address
    // ==========================================
    if (req.method === 'PATCH') {
      await prisma.userAddress.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });

      const updated = await prisma.userAddress.update({
        where: { id },
        data: { isDefault: true },
      });

      return res.status(200).json({ success: true, address: updated });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error: any) {
    console.error('User Address ID API Error:', error);
    reportServerError(error, req);
    return res.status(500).json({ message: 'Internal server error while modifying address' });
  }
}
