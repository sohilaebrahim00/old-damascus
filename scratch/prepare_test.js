/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

async function run() {
  const envPath = path.join(__dirname, '../.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('.env.local not found');
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.\-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      env[key] = value.trim();
    }
  });

  const cloverEnv = env.CLOVER_ENV || 'sandbox';
  const merchantId = env.CLOVER_MERCHANT_ID;
  const accessToken = env.CLOVER_ACCESS_TOKEN || env.CLOVER_API_TOKEN;

  if (!merchantId || !accessToken) {
    console.error('Missing CLOVER_MERCHANT_ID or CLOVER_ACCESS_TOKEN in env');
    return;
  }

  const apiBase = cloverEnv === 'production' ? 'https://api.clover.com' : 'https://sandbox.dev.clover.com';
  
  async function fetchClover(endpoint) {
    const url = `${apiBase}/v3/merchants/${merchantId}${endpoint}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to fetch ${endpoint}: ${res.status} ${text}`);
    }
    return res.json();
  }

  try {
    const merchantInfo = await fetchClover('');
    console.log(`Merchant ID: ${merchantInfo.id}`);
    console.log(`Merchant Name: ${merchantInfo.name}`);
    
    const itemId = 'X7J8DGH1S2SWT';
    const itemDetails = await fetchClover(`/items/${itemId}?expand=taxRates`);
    
    console.log(`Item ID: ${itemDetails.id}`);
    console.log(`Item Name: ${itemDetails.name}`);
    console.log(`Item Price (cents): ${itemDetails.price}`);
    
    let isTaxable = false;
    let taxRateStr = "0%";
    if (itemDetails.taxRates && itemDetails.taxRates.elements && itemDetails.taxRates.elements.length > 0) {
      isTaxable = true;
      taxRateStr = (itemDetails.taxRates.elements[0].rate / 100000).toFixed(2) + "%";
    }
    console.log(`Tax Rates: ${taxRateStr}`);
    
    // Generate new checkoutReference
    const checkoutReference = crypto.randomUUID();
    console.log(`New checkoutReference: ${checkoutReference}`);
    
  } catch (err) {
    console.error('Global execution error:', err);
  }
}

run();
