
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { clientId, clientSecret } = await req.json()

    if (!clientId || !clientSecret) {
      throw new Error('Missing clientId or clientSecret')
    }

    // 1. Get Access Token
    const authString = btoa(`${clientId}:${clientSecret}`)
    const tokenResponse = await fetch('https://api-sec-vlc.hotmart.com/security/oauth/token?grant_type=client_credentials', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json'
      }
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      throw new Error(`Failed to authenticate with Hotmart: ${errorText}`)
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // 2. Get Products
    const productsResponse = await fetch('https://developers.hotmart.com/products/api/v1/products', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!productsResponse.ok) {
      const errorText = await productsResponse.text()
      throw new Error(`Failed to fetch products: ${errorText}`)
    }

    const productsData = await productsResponse.json()
    const products = productsData.items || productsData.data || []

    // 3. Fetch Offers and Plans for each product
    const productsWithOffers = await Promise.all(products.map(async (p: any) => {
      const productId = p.ucode || p.id; // Use ucode if available, otherwise id
      let allOffers: any[] = [];

      try {
        // Fetch Offers
        const offersRes = await fetch(`https://developers.hotmart.com/products/api/v1/products/${productId}/offers`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (offersRes.ok) {
          const offersData = await offersRes.json();
          // Handle API response wrapped in array [ { items: [...] } ]
          const dataObj = Array.isArray(offersData) ? offersData[0] : offersData;
          const items = dataObj.items || dataObj.data || [];
          
          allOffers = [...allOffers, ...items.map((o: any) => ({
            key: o.key || o.offer_key || o.code, // Use code if key/offer_key missing
            name: o.name || `Oferta ${o.code || o.key}`,
            flows: {}
          }))];
        }

        // Fetch Plans
        const plansRes = await fetch(`https://developers.hotmart.com/products/api/v1/products/${productId}/plans`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (plansRes.ok) {
            const plansData = await plansRes.json();
            const items = plansData.items || plansData.data || [];
            allOffers = [...allOffers, ...items.map((plan: any) => ({
              key: plan.id?.toString() || plan.name, // Plans might use ID
              name: plan.name || `Plano ${plan.id}`,
              flows: {}
            }))];
          }

      } catch (err) {
        console.error(`Error fetching offers/plans for product ${productId}:`, err);
        // Continue with empty offers if fail
      }

      return {
        id: p.id,
        name: p.name,
        offers: allOffers
      };
    }));

    return new Response(JSON.stringify({ products: productsWithOffers }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
