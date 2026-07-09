import { NextResponse, type NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/dbConnect';
import Product from '../../../../_models/Product';

export async function PATCH(request: NextRequest, context: { params: { id: string } | Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getAuth(request);
  if (!session.userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.sku !== undefined) updates.sku = body.sku;
    if (body.category !== undefined) updates.category = body.category;
    if (body.minThreshold !== undefined) updates.minThreshold = Number(body.minThreshold);
    if (body.npkRatio !== undefined) updates.npkRatio = body.npkRatio;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: 'No editable fields provided' }, { status: 400 });
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: id, userId: session.userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedProduct }, { status: 200 });
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
    const deletedProduct = await Product.findOneAndDelete({ _id: id, userId: session.userId });
    if (!deletedProduct) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: deletedProduct }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
