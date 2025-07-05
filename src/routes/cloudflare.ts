import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import Domain from '../models/Domain';
import Customer from '../models/Customer';
import { Request, Response } from 'express';
dotenv.config();
const router = express.Router();

// Main route to import Cloudflare domains
router.get('/import-from-cloudflare', async (req: Request, res: Response): Promise<void> => {
  try {
    const CLOUDFLARE_TOKEN = process.env.CLOUDFLARE_TOKEN;
    if (!CLOUDFLARE_TOKEN) {
        res.status(400).json({ error: 'Missing CLOUDFLARE_TOKEN in environment' });
        return;
      }

    let page = 1;
    let totalPages = 1;
    const allDomains: any[] = [];

    // Create/find default customer
    const defaultCustomer = await Customer.findOneAndUpdate(
      { email: 'cloudflare@signroots.com' },
      { name: 'Cloudflare Client', phone: '0000000000' },
      { upsert: true, new: true }
    );

    // Paginate through all Cloudflare zones
    do {
      const response = await axios.get('https://api.cloudflare.com/client/v4/zones', {
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        params: {
          page,
          per_page: 50
        }
      });

      const { result, result_info } = response.data;
      totalPages = result_info.total_pages || 1;

      const bulkOps = result.map((zone: any) => {
        allDomains.push(zone);
        return {
          updateOne: {
            filter: { domainName: zone.name },
            update: {
              $set: {
                domainName: zone.name,
                status: zone.status,
                nameServers: zone.name_servers,
                registrationDate: new Date(zone.created_on),
                originalRegistrar: zone.original_registrar,
                expiryDate: new Date(
                  new Date(zone.created_on).setFullYear(
                    new Date(zone.created_on).getFullYear() + 1
                  )
                ),
                managedBy: 'Signroots',
                lockStatus: zone.paused ? 'Locked' : 'Unlocked',
                customer: defaultCustomer._id,
                domainSource:"Cloudflare",
                dnsDetails: []
              }
            },
            upsert: true
          }
        };
      });

      if (bulkOps.length > 0) {
        await Domain.bulkWrite(bulkOps);
      }

      page++;
    } while (page <= totalPages);

    res.status(200).json({
      message: '✅ All Cloudflare domains imported successfully',
      totalDomains: allDomains.length
    });
  } catch (error: any) {
    console.error('❌ Import Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to import domains from Cloudflare ❌' });
  }
});

export default router;
