const API_BASE = "https://v3.football.api-sports.io";

const CACHE_TTL = {
  fixtures: 60,
  details: 30,
  predictions: 21600,
  teams: 86400
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json; charset=utf-8"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: CORS_HEADERS
  });
}

async function apiRequest(endpoint, env, ttl) {
  const cacheKey = new Request(
    `https://charara-matches-cache.local${endpoint}`,
    { method: "GET" }
  );

  const cache = caches.default;
  const cached = await cache.match(cacheKey);

  if (cached) return await cached.json();

  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "x-apisports-key": env.API_SPORTS_KEY,
      "Accept": "application/json"
    }
  });

  const data = await response.json();

  if (!response.ok || (data.errors && Object.keys(data.errors).length)) {
    throw new Error(
      `API-Sports HTTP ${response.status}: ` +
      JSON.stringify(data.errors || {})
    );
  }

  const result = {
    success: true,
    data
  };

  const cachedResponse = new Response(JSON.stringify(result), {
    headers: {
      ...CORS_HEADERS,
      "Cache-Control": `public, max-age=${ttl}`
    }
  });

  await cache.put(cacheKey, cachedResponse);
  return result;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method !== "GET") {
      return json({ success: false, error: "Method not allowed" }, 405);
    }

    if (!env.API_SPORTS_KEY) {
      return json({
        success: false,
        error: "API_SPORTS_KEY is not configured"
      }, 500);
    }

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "");

    try {
      if (path === "" || path === "/") {
        return json({
          success: true,
          worker: "charara-matches-api",
          provider: "API-Sports",
          routes: [
            "/fixtures?date=YYYY-MM-DD",
            "/fixtures?id=FIXTURE_ID",
            "/predictions?fixture=FIXTURE_ID",
            "/teams/search?query=TEAM_NAME"
          ]
        });
      }

      if (path === "/fixtures") {
        const date = url.searchParams.get("date");
        const id = url.searchParams.get("id");

        if (id && /^\d+$/.test(id)) {
          return json(await apiRequest(
            `/fixtures?id=${encodeURIComponent(id)}`,
            env,
            CACHE_TTL.details
          ));
        }

        if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return json(await apiRequest(
            `/fixtures?date=${encodeURIComponent(date)}`,
            env,
            CACHE_TTL.fixtures
          ));
        }

        return json({
          success: false,
          error: "Provide a valid date or fixture id"
        }, 400);
      }

      if (path === "/predictions") {
        const fixture = url.searchParams.get("fixture");

        if (!fixture || !/^\d+$/.test(fixture)) {
          return json({
            success: false,
            error: "A valid fixture id is required"
          }, 400);
        }

        return json(await apiRequest(
          `/predictions?fixture=${encodeURIComponent(fixture)}`,
          env,
          CACHE_TTL.predictions
        ));
      }

      if (path === "/teams/search") {
        const query = (url.searchParams.get("query") || "").trim();

        if (query.length < 2 || query.length > 80) {
          return json({
            success: false,
            error: "Team search query must contain 2 to 80 characters"
          }, 400);
        }

        const result = await apiRequest(
          `/teams?search=${encodeURIComponent(query)}`,
          env,
          CACHE_TTL.teams
        );

        return json({
          success: true,
          teams: (result.data.response || []).map(item => ({
            id: item.team?.id,
            name: item.team?.name,
            country: item.team?.country,
            logo: item.team?.logo
          })).filter(team => team.id && team.name)
        });
      }

      return json({
        success: false,
        error: "Route not found"
      }, 404);

    } catch (error) {
      return json({
        success: false,
        error: error.message || "Upstream API error"
      }, 502);
    }
  }
};
