/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
const fs = require('fs');
const path = require('path');

async function run() {
  const envPath = path.join(__dirname, '../.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('FAIL - .env.local not found');
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.\-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      env[key] = value.trim();
    }
  });

  const merchantId = env.CLOVER_MERCHANT_ID;
  const accessToken = env.CLOVER_ACCESS_TOKEN || env.CLOVER_API_TOKEN;
  const ecomPrivateKey = env.CLOVER_PRIVATE_TOKEN || env.CLOVER_PRIVATE_KEY;
  const ecomPublicKey = env.NEXT_PUBLIC_CLOVER_PUBLIC_TOKEN || env.NEXT_PUBLIC_CLOVER_PUBLIC_KEY;
  const liveCheckout = env.NEXT_PUBLIC_ENABLE_LIVE_CHECKOUT;

  const apiBase = 'https://api.clover.com';
  const ecomBase = 'https://scl.clover.com';

  const results = {};

  async function testRestGet(name, endpoint) {
    try {
      const res = await fetch(`${apiBase}/v3/merchants/${merchantId}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });
      if (res.ok) {
        results[name] = 'PASS';
      } else {
        results[name] = `FAIL (HTTP ${res.status})`;
      }
    } catch (e) {
      results[name] = 'FAIL (Network error)';
    }
  }

  // 1. Merchant
  await testRestGet('Merchant', '');
  // 2. Categories
  await testRestGet('Categories', '/categories?limit=1');
  // 3. Items
  await testRestGet('Items', '/items?limit=1');
  // 4. Modifier Groups
  await testRestGet('Modifier Groups', '/modifier_groups?limit=1');
  // 5. Taxes
  await testRestGet('Taxes', '/tax_rates?limit=1');
  // 6. Order Types
  await testRestGet('Order Types', '/order_types?limit=1');

  // 7. Checkout initialization
  try {
    const configRes = await fetch('http://localhost:3000/api/clover/config');
    const previewRes = await fetch('http://localhost:3000/api/clover/checkout-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ menuItemId: '71T948RMM7VC8', quantity: 1, selectedModifiers: [] }],
        orderType: 'pickup'
      })
    });
    if (configRes.ok && previewRes.ok) {
      const configData = await configRes.json();
      const previewData = await previewRes.json();
      if (configData.merchantId === merchantId && configData.publicKey && configData.directOrderingEnabled && previewData.success) {
        results['Checkout initialization'] = 'PASS';
      } else {
        results['Checkout initialization'] = 'FAIL (Invalid config/preview payload)';
      }
    } else {
      let previewText = '';
      try { previewText = await previewRes.text(); } catch(e){}
      results['Checkout initialization'] = `FAIL (Config status: ${configRes.status}, Preview status: ${previewRes.status})`;
    }
  } catch (e) {
    results['Checkout initialization'] = 'FAIL (Local server unreachable)';
  }

  // 8. Payment tokenization
  try {
    if (!ecomPublicKey || !ecomPrivateKey) {
      results['Payment tokenization'] = 'FAIL (Missing public or private eCommerce token)';
    } else {
      const sclRes = await fetch(`${ecomBase}/v1/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ecomPrivateKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: 100,
          currency: 'usd'
        })
      });
      if (sclRes.status !== 401 && sclRes.status !== 403) {
        results['Payment tokenization'] = 'PASS';
      } else {
        results['Payment tokenization'] = `FAIL (HTTP ${sclRes.status})`;
      }
    }
  } catch (e) {
    results['Payment tokenization'] = 'FAIL (Network error checking eCommerce API)';
  }

  // 9. Order creation
  try {
    const orderRes = await fetch(`${apiBase}/v3/merchants/${merchantId}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        state: 'open',
        title: 'VERIFICATION_TEST_ORDER',
        note: 'Automated verification test'
      })
    });
    if (orderRes.ok) {
      const orderData = await orderRes.json();
      if (orderData.id) {
        try {
          await fetch(`${apiBase}/v3/merchants/${merchantId}/orders/${orderData.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json'
            }
          });
        } catch (delErr) {}
      }
      results['Order creation'] = 'PASS';
    } else {
      results['Order creation'] = `FAIL (HTTP ${orderRes.status})`;
    }
  } catch (e) {
    results['Order creation'] = 'FAIL (Network error creating V3 order)';
  }

  console.log('==============================================');
  console.log('LIVE CLOVER VERIFICATION REPORT');
  console.log('==============================================');
  Object.entries(results).forEach(([key, val]) => {
    console.log(`- ${key}: ${val}`);
  });
  console.log('==============================================');
}

run();
