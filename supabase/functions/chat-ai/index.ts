import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages } = await req.json()
    // On essaie de récupérer la clé sous les deux noms possibles par sécurité
    const apiKey = Deno.env.get('GROQ_API_KEY') || Deno.env.get('VITE_XAI_API_KEY')

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Clé API manquante dans Supabase" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // CHANGEMENT ICI : Utilisation de Llama 3.3
        model: "llama-3.3-70b-versatile", 
        messages: [
          { role: "system", content: `Tu es l'assistant personnel d'un artisan entrepreneur. Ton rôle est double :

Aide technique : Aide à rédiger des lignes de devis précises (ex: 'Pose de parquet flottant chêne massif incluant sous-couche phonique').

Conseil gestion : Aide l'artisan à comprendre ses stats. Si une facture est impayée depuis longtemps, propose-lui un modèle de message de relance poli mais ferme.
Réponds toujours de manière courte et efficace.` },
          ...messages
        ],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || "Erreur API" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    return new Response(
      JSON.stringify({ reply: data.choices[0].message.content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  }
})