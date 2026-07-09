import { NextResponse, type NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/dbConnect';
import Batch from '../../../_models/Batch';
import Transaction from '../../../_models/Transaction';

// 1. GET ALL TRANSACTIONS (HISTORICAL AUDIT LOG)
export async function GET(request: NextRequest) {
  const session = await getAuth(request);
  if (!session.userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const transactions = await Transaction.find({ performedBy: session.userId })
      .populate('product')
      .populate('batch')
      .sort({ createdAt: -1 }); // Newest logs first
    return NextResponse.json({ success: true, data: transactions }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

// 2. DISPATCH / DEDUCT STOCK (STOCK OUT ENGINE WITH FIFO PROCESSING)
export async function POST(request: NextRequest) {
  const session = await getAuth(request);
  if (!session.userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const { productId, quantity, reason } = await request.json();

    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json({ success: false, error: "Invalid product or quantity" }, { status: 400 });
    }

    // Find the oldest active batch matching this product that has available stock
    // IMPORTANT: Also filter batches by the current user
    const activeBatches = await Batch.find({
      userId: session.userId,
      product: productId,
      currentQuantity: { $gt: 0 }
    }).sort({ expiryDate: 1 }); // Sort by closest expiration date first (FIFO)

    // Calculate total available across all matching batches
    const totalAvailable = activeBatches.reduce((acc, b) => acc + b.currentQuantity, 0);
    if (totalAvailable < quantity) {
      return NextResponse.json({ 
        success: false, 
        error: `Insufficient stock. Requested: ${quantity}, Total Available: ${totalAvailable}` 
      }, { status: 400 });
    }

    let remainingToDeduct = quantity;
    const processedTransactions = [];

    // Loop through batches and deduct quantities systematically
    for (const batch of activeBatches) {
      if (remainingToDeduct <= 0) break;

      const deduction = Math.min(batch.currentQuantity, remainingToDeduct);
      
      // Update the Batch physical record
      batch.currentQuantity -= deduction;
      await batch.save();

      // Log the action to the transaction history ledger
      const transactionRecord = await Transaction.create({
        type: 'OUTFLOW',
        product: productId,
        batch: batch._id,
        quantity: deduction,
        reason: reason || "Standard inventory dispatch",
        performedBy: session.userId // Use the authenticated user's ID
      });

      processedTransactions.push(transactionRecord);
      remainingToDeduct -= deduction;
    }

    return NextResponse.json({ 
      success: true, 
      message: "Stock successfully deducted via FIFO rules.", 
      data: processedTransactions 
    }, { status: 201 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}