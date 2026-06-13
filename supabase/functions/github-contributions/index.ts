import "@supabase/functions-js/edge-runtime.d.ts"

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const QUERY = `
  query {
    viewer {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS })
  }

  const token = Deno.env.get('GITHUB_TOKEN')
  if (!token) {
    return new Response(JSON.stringify({ error: 'Missing GITHUB_TOKEN' }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: QUERY }),
  })

  const json = await res.json()
  const cal = json?.data?.viewer?.contributionsCollection?.contributionCalendar

  if (!cal) {
    return new Response(JSON.stringify({ error: 'Failed to fetch contributions' }), {
      status: 502,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify(cal), {
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
})
