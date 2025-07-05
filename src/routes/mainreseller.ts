// routes/reseller.ts

import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import Domain from '../models/Domain';
import Customer from '../models/Customer';

dotenv.config();
const router = express.Router();

// ✅ Get all domains
router.get('/', async (_req, res) => {
  try {
    const domains = await Domain.find()
      .populate('customer')
      .sort({ expiryDate: 1 });

    res.status(200).json(domains);
  } catch (err) {
    console.error('❌ Error fetching domains:', err);
    res.status(500).json({ error: 'Failed to fetch domains' });
  }
});
let allDomains = [];
let page = 1;
const perPage = 100;

// ✅ Import domains from ResellerClub (Paginated)
router.get('/import/mainresellerclub', async (_req, res) => {
    try {
      const { MAIN_RESELLER_USER_ID, MAIN_RESELLER_API_KEY } = process.env;
      const perPage = 100;
      let page = 1;
      let allDomains: any[] = [];
  
      console.log("RESELLER_USER_ID:", MAIN_RESELLER_USER_ID);
      console.log("RESELLER_API_KEY:", MAIN_RESELLER_API_KEY);
  
      while (true) {
        const response = await axios.get('https://httpapi.com/api/domains/search.json', {
          params: {
            'auth-userid': MAIN_RESELLER_USER_ID,
            'api-key': MAIN_RESELLER_API_KEY,
            'no-of-records': perPage,
            'page-no': page,
          },
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'application/json',
          },
        });
  
        const rawData = response.data;
        const keys = Object.keys(rawData).filter((key) => /^\d+$/.test(key));
        if (keys.length === 0) break;
  
        for (const key of keys) {
          allDomains.push(rawData[key]);
        }
  
        page++;
      }
  
      const savedDomains = [];
  
      for (const d of allDomains) {
        const resellerCustomerId = d['entity.customerid'];
  
        const customerRes = await axios.get('https://httpapi.com/api/customers/details-by-id.json', {
          params: {
            'auth-userid': MAIN_RESELLER_USER_ID,
            'api-key': MAIN_RESELLER_API_KEY,
            'customer-id': resellerCustomerId,
          },
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'application/json',
          },
        });
  
        const customerData = customerRes.data;
  
        const customer = await Customer.findOneAndUpdate(
          { resellerCustomerId: customerData.customerid },
          {
            name: customerData.name,
            email: customerData.useremail,
            company: customerData.company,
            address: customerData.address1,
            city: customerData.city,
            country: customerData.country,
            phone: customerData.mobileno,
            resellerCustomerId: customerData.customerid,
          },
          { new: true, upsert: true }
        );
  
        const domainData = {
          domainName: d['entity.description'],
          customer: customer._id,
          status: d['entity.currentstatus'],
          managedBy: 'Signroots',
          registrationDate: new Date(Number(d['orders.creationtime']) * 1000),
          expiryDate: new Date(Number(d['orders.endtime']) * 1000),
          originalRegistrar: d['entitytype.entitytypekey'] || 'Unknown',
          lockStatus: d['orders.transferlock'] === 'true' ? 'Locked' : 'Unlocked',
          domainSource: ['resellerclub'],
          nameServers: [],
          dnsDetails: [],
        };
  
        const saved = await Domain.findOneAndUpdate(
          { domainName: domainData.domainName },
          domainData,
          { upsert: true, new: true }
        );
  
        savedDomains.push(saved);
      }
  
      res.status(200).json({
        message: '✅ ResellerClub domains imported successfully',
        count: savedDomains.length,
        data: savedDomains,
      });
  
    } catch (error: any) {
      console.error('❌ ResellerClub Import Error:', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack,
      });
  
      res.status(500).json({ error: 'Failed to import ResellerClub domains ❌' });
    }
});
  
export default router;