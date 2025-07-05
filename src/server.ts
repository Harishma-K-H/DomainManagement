import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import domainRoutes from './routes/reseller';
import customerRoutes from './routes/customer';
import cloudflareRoutes from './routes/cloudflare';
import MainResellerRoutes from './routes/mainreseller'
import cors from 'cors';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;


// ✅ Allow requests from React dev server
app.use(cors({
  origin: 'http://localhost:5173'
}));

// Other middlewares
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI as string)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err));

// ✅ Add root route
app.get('/', (_, res) => {
  res.send('API is working 🚀');
});

// Your domain routes
app.use('/api/domains', domainRoutes);
app.use('/api/cloudflare', cloudflareRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/mainreseller', MainResellerRoutes);
app.use(cors({ origin: 'http://localhost:5173' }));
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
