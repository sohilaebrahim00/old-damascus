/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

async function run() {
  // Load .env.local manually
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
  
  console.log(`Using environment: ${cloverEnv}`);
  console.log(`API Base: ${apiBase}`);
  console.log(`Merchant ID: ${merchantId}`);

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
    // 1. Fetch the items of interest
    const itemsOfInterest = [
      { name: 'Chicken Shawarma Wrap', id: '71T948RMM7VC8' },
      { name: 'Falafel Sandwich', id: 'X7J8DGH1S2SWT' },
      { name: 'Chicken Nuggets (6) Pcs', id: 'E5QRFFKK6B0WP' }
    ];

    for (const item of itemsOfInterest) {
      console.log(`\n==================================================`);
      console.log(`Fetching Item: ${item.name} (${item.id})`);
      console.log(`==================================================`);
      try {
        const itemDetails = await fetchClover(`/items/${item.id}?expand=categories,modifierGroups,taxRates,itemStock`);
        console.log(JSON.stringify(itemDetails, null, 2));

        // If it has modifier groups, fetch details for each
        if (itemDetails.modifierGroups && itemDetails.modifierGroups.elements) {
          console.log(`\nModifier Groups for ${item.name}:`);
          for (const mgRef of itemDetails.modifierGroups.elements) {
            try {
              const mgDetails = await fetchClover(`/modifier_groups/${mgRef.id}?expand=modifiers`);
              console.log(`- Modifier Group: ${mgDetails.name} (${mgDetails.id})`);
              console.log(`  MinRequired: ${mgDetails.minRequired}, MaxAllowed: ${mgDetails.maxAllowed}`);
              if (mgDetails.modifiers && mgDetails.modifiers.elements) {
                console.log(`  Modifiers:`);
                mgDetails.modifiers.elements.forEach(m => {
                  console.log(`    * ${m.name} (${m.id}): price = $${(m.price/100).toFixed(2)}, available = ${m.available}`);
                });
              }
            } catch (err) {
              console.error(`  Error fetching modifier group ${mgRef.id}:`, err.message);
            }
          }
        }
      } catch (err) {
        console.error(`Error fetching item ${item.id}:`, err.message);
      }
    }
  } catch (err) {
    console.error('Global execution error:', err);
  }
}

run();
