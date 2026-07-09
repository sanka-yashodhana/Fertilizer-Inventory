import { NextResponse, type NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/dbConnect';
import Batch from '../../../../_models/Batch';

export async function PATCH(request: NextRequest, context: { params: { id: string } | Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getAuth(request);
  if (!session.userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const batch = await Batch.findOne({ _id: id, userId: session.userId });
    if (!batch) {
      return NextResponse.json({ success: false, error: 'Batch not found' }, { status: 404 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.batchNumber !== undefined) updates.batchNumber = body.batchNumber;
    if (body.product !== undefined) updates.product = body.product;
    if (body.quantityReceived !== undefined) {
      const newQuantity = Number(body.quantityReceived);
      if (isNaN(newQuantity) || newQuantity < 0) {
        return NextResponse.json({ success: false, error: 'Invalid quantity received' }, { status: 400 });
      }
      updates.quantityReceived = newQuantity;
      if (batch.currentQuantity > newQuantity) {
        updates.currentQuantity = newQuantity;
      }
    }
    if (body.unit !== undefined) updates.unit = body.unit;
    if (body.costPrice !== undefined) updates.costPrice = Number(body.costPrice);
    if (body.manufactureDate !== undefined) updates.manufactureDate = body.manufactureDate;
    if (body.expiryDate !== undefined) updates.expiryDate = body.expiryDate;
    if (body.storageLocation !== undefined) updates.storageLocation = body.storageLocation;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: 'No editable fields provided' }, { status: 400 });
    }

    Object.assign(batch, updates);
    await batch.save();

    return NextResponse.json({ success: true, data: batch }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } | Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getAuth(request);
  if (!session.userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const deletedBatch = await Batch.findOneAndDelete({ _id: id, userId: session.userId });
    if (!deletedBatch) {
      return NextResponse.json({ success: false, error: 'Batch not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: deletedBatch }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
