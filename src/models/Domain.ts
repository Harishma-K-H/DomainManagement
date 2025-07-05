import mongoose, { Document } from 'mongoose';

export interface IDomain extends Document {
  domainName: string;
  status?: string;
  customer?: mongoose.Types.ObjectId;
  registrarName?: mongoose.Types.ObjectId;
  managedBy: 'Signroots' | 'Customer';
  registrationDate: Date;
  expiryDate: Date;
  originalRegistrar?: string;
  nameServers: string[];
  dnsDetails: string[];
  lockStatus?: string;
  domainSource?: string[];
  resellerCustomerId?: string; // ✅ ADD THIS FIELD
}

const domainSchema = new mongoose.Schema<IDomain>({
  domainName: { type: String, required: true },
  status: { type: String },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  registrarName: { type: mongoose.Schema.Types.ObjectId, ref: 'Registrar' },
  managedBy: { type: String, enum: ['Signroots', 'Customer'], required: true },
  registrationDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  originalRegistrar: { type: String },
  nameServers: [{ type: String }],
  dnsDetails: [{ type: String }],
  lockStatus: { type: String },
  domainSource: [{ type: String }],
  resellerCustomerId: { type: String }, // ✅ ADD HERE TOO
}, { timestamps: true });

export default mongoose.model<IDomain>('Domain', domainSchema);
