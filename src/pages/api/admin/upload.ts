import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadBase64ToStorage } from '@/lib/storage';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    const isAdmin = session?.user?.role?.toString().toUpperCase() === 'ADMIN';

    if (!session || !isAdmin) {
      return res.status(401).json({ message: 'Unauthorized. Admin access required.' });
    }

    const { image, filename = 'image.jpg', folder = 'products' } = req.body;

    if (!image) {
      return res.status(400).json({ message: 'Image data is required' });
    }

    // If it's already an http/https URL, return it directly
    if (typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://'))) {
      return res.status(200).json({ url: image });
    }

    const publicUrl = await uploadBase64ToStorage(image, filename, folder);

    return res.status(200).json({
      url: publicUrl,
      message: 'Image uploaded successfully to Supabase Storage',
    });
  } catch (error: any) {
    console.error('Upload handler error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to upload image',
    });
  }
}
