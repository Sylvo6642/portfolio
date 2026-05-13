import "@supabase/functions-js/edge-runtime.d.ts"

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

Deno.serve(async () => {
  const token = Deno.env.get('GITHUB_TOKEN')
  if (!token) {
    return new Response(JSON.stringify({ error: 'Missing GITHUB_TOKEN' }), { status: 500 })
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
    return new Response(JSON.stringify({ error: 'Failed to fetch contributions' }), { status: 502 })
  }

  return new Response(JSON.stringify(cal), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
})
