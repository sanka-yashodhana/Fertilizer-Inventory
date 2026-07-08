import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Batch from '../../../_models/Batch'; // Adjust based on your folder structure
import '../../../_models/Product'; // Import for model registration

// 1. GET ALL BATCHES (WITH PRODUCT INFORMATION POPULATED)
export async function GET() {
  try {
    await dbConnect();
    const batches = await Batch.find({}).populate('product');
    return NextResponse.json({ success: true, data: batches }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// 2. STOCK IN A NEW BATCH
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    // Set currentQuantity equal to quantityReceived initially
    const batchPayload = {
      ...body,
      currentQuantity: body.quantityReceived
    };
    
    const newBatch = await Batch.create(batchPayload);
    return NextResponse.json({ success: true, data: newBatch }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}