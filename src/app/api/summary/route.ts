import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/dbConnect';
import Product from '../../../_models/Product';
import Batch from '../../../_models/Batch';
import '../../../_models/Supplier'; // Import for model registration

export async function GET(request: Request) {
  const session = await getAuth(request);
  if (!session.userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();

    // 1. Get total distinct product profiles for the user
    const totalProducts = await Product.countDocuments({ userId: session.userId });

    // 2. Fetch all active warehouse batches for the user
    const activeBatches = await Batch.find({ userId: session.userId, currentQuantity: { $gt: 0 } }).populate('product');

    // 3. Process calculations for metrics
    let totalStockVolume = 0;
    const lowStockAlerts: any[] = [];
    const expiringSoonAlerts: any[] = [];
    
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    // Track total volume per product to compute threshold alerts dynamically
    const productVolumeMap: { [key: string]: number } = {};

    activeBatches.forEach((batch) => {
      totalStockVolume += batch.currentQuantity;
      const productId = batch.product?._id?.toString();

      if (productId) {
        productVolumeMap[productId] = (productVolumeMap[productId] || 0) + batch.currentQuantity;
      }

      // Check for items expiring within 30 days or already expired
      const expDate = new Date(batch.expiryDate);
      if (expDate <= thirtyDaysFromNow) {
        expiringSoonAlerts.push({
          _id: batch._id,
          batchNumber: batch.batchNumber,
          productName: batch.product?.name || 'Unknown',
          expiryDate: batch.expiryDate,
          daysLeft: Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        });
      }
    });

    // 4. Query all products for the user to crosscheck calculated volumes against their set minimum thresholds
    const allProducts = await Product.find({ userId: session.userId });
    allProducts.forEach((prod) => {
      const currentVol = productVolumeMap[prod._id.toString()] || 0;
      if (currentVol <= prod.minThreshold) {
        lowStockAlerts.push({
          _id: prod._id,
          name: prod.name,
          sku: prod.sku,
          currentVolume: currentVol,
          threshold: prod.minThreshold
        });
      }
    });

    return NextResponse.json({
      success: true,
      metrics: {
        totalProducts,
        activeBatchCount: activeBatches.length,
        totalStockVolume,
        lowStockCount: lowStockAlerts.length,
        expiringCount: expiringSoonAlerts.length
      },
      alerts: {
        lowStock: lowStockAlerts,
        expiringSoon: expiringSoonAlerts.sort((a, b) => a.daysLeft - b.daysLeft)
      }
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}