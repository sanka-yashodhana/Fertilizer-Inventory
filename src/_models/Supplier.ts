import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplier extends Document {
  userId: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email: string;
  address?: string;
}

const SupplierSchema: Schema = new Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true, unique: true, trim: true },
  contactPerson: { type: String, trim: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, lowerCase: true, trim: true },
  address: { type: String }
}, { timestamps: true });

export default mongoose.models.Supplier || mongoose.model<ISupplier>('Supplier', SupplierSchema);