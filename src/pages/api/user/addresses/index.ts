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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User account not found' });
    }

    // ==========================================
    // GET: Fetch all saved addresses for user
    // ==========================================
    if (req.method === 'GET') {
      const addresses = await prisma.userAddress.findMany({
        where: { userId: user.id },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      });

      const formatted = addresses.map((a) => ({
        id: a.id,
        name: `${a.firstName} ${a.lastName}`.trim() || 'Resident',
        firstName: a.firstName,
        lastName: a.lastName,
        street: a.street,
        apartment: a.apartment || '',
        city: a.city,
        state: a.state,
        zip: a.zipCode,
        zipCode: a.zipCode,
        country: a.country || 'India',
        phone: a.phone,
        type: a.type,
        isDefault: a.isDefault,
        createdAt: a.createdAt,
      }));

      return res.status(200).json(formatted);
    }

    // ==========================================
    // POST: Create a new delivery address
    // ==========================================
    if (req.method === 'POST') {
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

      // Extract names
      let fName = firstName;
      let lName = lastName;
      if (!fName && name) {
        const parts = name.trim().split(/\s+/);
        fName = parts[0] || 'Resident';
        lName = parts.slice(1).join(' ') || '';
      }
      fName = fName || 'Resident';
      lName = lName || '';

      const finalZip = (zipCode || zip || '').trim();
      const finalStreet = (street || '').trim();
      const finalCity = (city || '').trim();
      const finalState = (state || '').trim();
      const finalPhone = (phone || '').trim();
      const finalCountry = (country || 'India').trim();

      if (!finalStreet || !finalCity || !finalState || !finalZip || !finalPhone) {
        return res.status(400).json({
          message: 'All address fields (Street, City, State, Postal Code, Mobile) are required.',
        });
      }

      // Check if user has any existing addresses
      const count = await prisma.userAddress.count({
        where: { userId: user.id },
      });

      const shouldBeDefault = Boolean(isDefault) || count === 0;

      // If this address is set as default, reset others
      if (shouldBeDefault && count > 0) {
        await prisma.userAddress.updateMany({
          where: { userId: user.id },
          data: { isDefault: false },
        });
      }

      const created = await prisma.userAddress.create({
        data: {
          userId: user.id,
          firstName: fName,
          lastName: lName,
          street: finalStreet,
          apartment: apartment ? apartment.trim() : null,
          city: finalCity,
          state: finalState,
          zipCode: finalZip,
          country: finalCountry,
          phone: finalPhone,
          type: type || 'HOME',
          isDefault: shouldBeDefault,
        },
      });

      return res.status(201).json({
        id: created.id,
        name: `${created.firstName} ${created.lastName}`.trim() || 'Resident',
        firstName: created.firstName,
        lastName: created.lastName,
        street: created.street,
        apartment: created.apartment || '',
        city: created.city,
        state: created.state,
        zip: created.zipCode,
        zipCode: created.zipCode,
        country: created.country,
        phone: created.phone,
        type: created.type,
        isDefault: created.isDefault,
        createdAt: created.createdAt,
      });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error: any) {
    console.error('User Address API Error:', error);
    reportServerError(error, req);
    return res.status(500).json({ message: 'Internal server error while handling address' });
  }
}
