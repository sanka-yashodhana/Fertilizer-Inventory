import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from "../../../_models/Product" // Adjust this import path depending on where you saved your models folder

// 1. GET ALL PRODUCTS
export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({}).populate('supplier');
    return NextResponse.json({ success: true, data: products }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// 2. CREATE A NEW PRODUCT
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const newProduct = await Product.create(body);
    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}