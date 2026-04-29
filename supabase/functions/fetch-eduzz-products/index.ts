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
    const { email, publicKey, apiKey } = await req.json()

    if (!email || !publicKey || !apiKey) {
      throw new Error('Missing email, publicKey or apiKey')
    }

    // 1. Authenticate with Eduzz to get a session token
    const tokenResponse = await fetch('https://api2.eduzz.com/credential/generate_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        publickey: publicKey,
        apikey: apiKey,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      throw new Error(`Failed to authenticate with Eduzz: ${errorText}`)
    }

    const tokenData = await tokenResponse.json()
    const token = tokenData?.data?.token || tokenData?.token

    if (!token) {
      throw new Error('Eduzz did not return a session token')
    }

    // 2. Fetch products
    const productsResponse = await fetch(
      'https://api2.eduzz.com/product/list?paginator[per_page]=100',
      {
        headers: {
          'token': token,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!productsResponse.ok) {
      const errorText = await productsResponse.text()
      throw new Error(`Failed to fetch products: ${errorText}`)
    }

    const productsData = await productsResponse.json()
    const items: any[] = productsData?.data || productsData?.items || []

    // Map Eduzz response to the same shape used by HotmartConfig (id, name, offers[])
    // Eduzz does not expose a clean "offers" concept via API, so each product gets a default offer.
    const products = items.map((p: any) => {
      const id = p.id_content ?? p.id ?? p.content_id ?? p.product_id
      const name = p.name || p.title || `Produto ${id}`
      return {
        id,
        name,
        offers: [
          {
            key: String(id),
            name: name + ' (padrão)',
            flows: {},
          },
        ],
      }
    })

    return new Response(JSON.stringify({ products }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
