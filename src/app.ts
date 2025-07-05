import express from 'express';
import domainRoutes from './routes/reseller'; // ✅ Make sure this exports a Router
import cors from 'cors';
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/domains', domainRoutes); // ✅ Make sure domainRoutes is a router

export default app;