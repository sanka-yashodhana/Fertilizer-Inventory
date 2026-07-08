import mongoose, { Schema, Document } from 'mongoose';

export interface IBatch extends Document {
  batchNumber: string;
  product: mongoose.Types.ObjectId;
  quantityReceived: number;
  currentQuantity: number;
  unit: 'kg' | 'bags' | 'liters';
  costPrice: number;
  manufactureDate: Date;
  expiryDate: Date;
  storageLocation?: string; // e.g., "Warehouse A - Aisle 3"
  isExpired: boolean;
}

const BatchSchema: Schema = new Schema({
  batchNumber: { type: String, required: true, unique: true, uppercase: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantityReceived: { type: Number, required: true, min: 0 },
  currentQuantity: { type: Number, required: true, min: 0 }, // Decrements as stock is issued
  unit: { type: String, enum: ['kg', 'bags', 'liters'], required: true },
  costPrice: { type: Number, required: true, min: 0 },
  manufactureDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  storageLocation: { type: String, trim: true }
}, { timestamps: true });

// Virtual property to automatically check if a batch has hit its expiration point
BatchSchema.virtual('isExpired').get(function(this: IBatch) {
  return new Date() > this.expiryDate;
});

export default mongoose.models.Batch || mongoose.model<IBatch>('Batch', BatchSchema);