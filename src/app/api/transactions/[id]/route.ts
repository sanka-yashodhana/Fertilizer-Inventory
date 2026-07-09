import { NextResponse, type NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/dbConnect';
import Transaction from '../../../../_models/Transaction';

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

    if (body.reason !== undefined) updates.reason = body.reason;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: 'No editable fields provided' }, { status: 400 });
    }

    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: id, performedBy: session.userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedTransaction) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedTransaction }, { status: 200 });
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
    const deletedTransaction = await Transaction.findOneAndDelete({ _id: id, performedBy: session.userId });
    if (!deletedTransaction) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: deletedTransaction }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
