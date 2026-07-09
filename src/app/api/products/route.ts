import { NextResponse, type NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/dbConnect';
import Product from "../../../_models/Product" // Adjust this import path depending on where you saved your models folder
import "../../../_models/Supplier"; // Import for model registration

// 1. GET ALL PRODUCTS
export async function GET(request: NextRequest) {
  const session = await getAuth(request);
  if (!session.userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const products = await Product.find({ userId: session.userId }).populate('supplier');
    return NextResponse.json({ success: true, data: products }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

// 2. CREATE A NEW PRODUCT
export async function POST(request: NextRequest) {
  const session = await getAuth(request);
  if (!session.userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await request.json();
    
    const newProduct = await Product.create({ ...body, userId: session.userId });
    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}