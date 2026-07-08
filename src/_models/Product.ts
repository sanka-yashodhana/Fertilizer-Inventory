import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  sku: string; // Stock Keeping Unit (Unique Identifier)
  description?: string;
  npkRatio: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
  // Your exact product categories mapping
  category: 
    | 'Inorganic' 
    | 'Weed Control Chemicals' 
    | 'Liquid' 
    | 'Granular' 
    | 'Pesticides' 
    | 'Pollinators' 
    | 'Others';
  minThreshold: number; // For low stock alert triggering
  supplier: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String },
  npkRatio: {
    nitrogen: { type: Number, default: 0, min: 0 },
    phosphorus: { type: Number, default: 0, min: 0 },
    potassium: { type: Number, default: 0, min: 0 }
  },
  category: { 
    type: String, 
    enum: [
      'Inorganic', 
      'Weed Control Chemicals', 
      'Liquid', 
      'Granular', 
      'Pesticides', 
      'Pollinators', 
      'Others'
    ], 
    required: true 
  },
  minThreshold: { type: Number, default: 10, min: 0 }, // Alert when below this quantity
  supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true }
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);