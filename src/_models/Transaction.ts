import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  type: 'INFLOW' | 'OUTFLOW' | 'ADJUSTMENT';
  product: mongoose.Types.ObjectId;
  batch?: mongoose.Types.ObjectId;
  quantity: number;
  reason?: string; // e.g., "Damaged item disposal", "Seasonal farm distribution"
  performedBy: string; // User/Admin identifier
  createdAt: Date;
}

const TransactionSchema: Schema = new Schema({
  type: { type: String, enum: ['INFLOW', 'OUTFLOW', 'ADJUSTMENT'], required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  batch: { type: Schema.Types.ObjectId, ref: 'Batch' }, // Optional if adjustment is broad
  quantity: { type: Number, required: true, min: 1 },
  reason: { type: String, trim: true },
  performedBy: { type: String, required: true } // Can map to user session IDs
}, { timestamps: true });

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);