import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '../../../_models/Product';
import Batch from '../../../_models/Batch';
import '../../../_models/Supplier'; // Import for model registration

export async function GET() {
  try {
    await dbConnect();

    // 1. Get total distinct product profiles
    const totalProducts = await Product.countDocuments();

    // 2. Fetch all active warehouse batches
    const activeBatches = await Batch.find({ currentQuantity: { $gt: 0 } }).populate('product');

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

    // 4. Query all products to crosscheck calculated volumes against their set minimum thresholds
    const allProducts = await Product.find({});
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