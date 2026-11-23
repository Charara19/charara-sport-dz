const SPORT_API = "https://sportapi.ai/api";

const CACHE_TTL = {
  leagues: 21600,
  standings: 1800,
  fixtures: 90,
  details: 60,
  events: 30,
  lineups: 1800,
  statistics: 60,
  teams: 900,
  players: 900
};

const ALLOWED_LEAGUES = new Set([
  "18","22","23","24","1","2","3","4","9","36",
  "68103","68102","68105","68101","17","66","92",
  "123","72","68116","68117","103","74","14022",
  "107","110","75","104","105","68084","68085",
  "43635","67","125"
]);

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

async function getSportData(endpoint, env, ttl) {
  const cacheKey = new Request(
    `https://charara-sport-cache.local${endpoint}`,
    { method: "GET" }
  );

  const cache = caches.default;
  const cached = await cache.match(cacheKey);

  if (cached) {
    return await cached.json();
  }

  const response = await fetch(`${SPORT_API}${endpoint}`, {
    method: "GET",
    headers: {
      "X-Api-Key": env.SPORTAPI_KEY,
      "Accept": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`SportAPI HTTP ${response.status}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error("SportAPI returned unsuccessful response");
  }

  const cachedResponse = new Response(JSON.stringify(data), {
    headers: {
      ...CORS_HEADERS,
      "Cache-Control": `public, max-age=${ttl}`
    }
  });

  await cache.put(cacheKey, cachedResponse);

  return data;
}

async function inspectSportApiMcp(env) {
  const endpoint = "https://sportapi.ai/mcp";
  const headers = {
    "X-Api-Key": env.SPORTAPI_KEY,
    "Accept": "application/json, text/event-stream",
    "Content-Type": "application/json"
  };
  const send = async (payload) => {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });
    return { status: response.status, body: await response.text() };
  };
  const initialized = await send({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "charara-sport-dz", version: "1.0.0" }
    }
  });
  if (initialized.status < 200 || initialized.status >= 300) {
    return { initializeStatus: initialized.status, error: initialized.body.slice(0, 1500) };
  }
  const initData = JSON.parse(initialized.body);
  const protocolVersion = initData?.result?.protocolVersion;
  if (!protocolVersion) {
    return { initializeStatus: initialized.status, error: "MCP initialize response has no protocolVersion", response: initialized.body.slice(0, 1500) };
  }
  await send({ jsonrpc: "2.0", method: "notifications/initialized" });
  const listed = await send({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list",
    params: {}
  });
  let result;
  try { result = JSON.parse(listed.body); }
  catch (error) { return { protocolVersion, toolsStatus: listed.status, response: listed.body.slice(0, 3000) }; }
  return {
    protocolVersion,
    initializeStatus: initialized.status,
    toolsStatus: listed.status,
    tools: result?.result?.tools || [],
    error: result?.error || null
  };
}
async function searchSportApiTeams(env, query, limit) {
  const endpoint = "https://sportapi.ai/mcp";
  const headers = {
    "X-Api-Key": env.SPORTAPI_KEY,
    "Accept": "application/json, text/event-stream",
    "Content-Type": "application/json"
  };
  const send = async (payload) => {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });
    const body = await response.text();
    if (!response.ok) throw new Error("SportAPI MCP HTTP " + response.status);
    return JSON.parse(body);
  };
  const initialized = await send({
    jsonrpc: "2.0", id: 1, method: "initialize",
    params: {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "charara-sport-dz", version: "1.0.0" }
    }
  });
  if (!initialized.result?.protocolVersion) {
    throw new Error("MCP initialization failed");
  }
  await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" })
  });
  const result = await send({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "find_teams",
      arguments: { query, limit }
    }
  });
  if (result.error) throw new Error(result.error.message || "MCP tool failed");
  const toolResult = result.result || {};
  const textContent = toolResult.content?.find(item => item.type === "text")?.text;
  let data = null;
  if (textContent) {
    try { data = JSON.parse(textContent); } catch (error) {}
  }
  return {
    success: true,
    query,
    total: data?.total ?? null,
    teams: data?.teams || [],
    result: data ? undefined : toolResult
  };
}
async function getSportApiLeague(env, leagueId) {
  const endpoint = "https://sportapi.ai/mcp";
  const headers = {
    "X-Api-Key": env.SPORTAPI_KEY,
    "Accept": "application/json, text/event-stream",
    "Content-Type": "application/json"
  };
  const send = async payload => {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });
    const body = await response.text();
    if (!response.ok) throw new Error("SportAPI MCP HTTP " + response.status);
    try {
      return body ? JSON.parse(body) : null;
    } catch (error) {
      const line = body.split("\n").find(item => item.startsWith("data:"));
      if (line) return JSON.parse(line.slice(5).trim());
      throw new Error("Invalid SportAPI MCP response");
    }
  };

  const initialized = await send({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "charara-sport-dz", version: "1.0.0" }
    }
  });
  if (!initialized?.result?.protocolVersion) {
    throw new Error("MCP initialization failed");
  }

  await send({
    jsonrpc: "2.0",
    method: "notifications/initialized"
  });

  const result = await send({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "get_league",
      arguments: { league_id: leagueId }
    }
  });

  if (result?.error) {
    throw new Error(result.error.message || "MCP get_league failed");
  }

  const toolResult = result?.result || {};
  const textContent = toolResult.content?.find(item => item.type === "text")?.text;
  let data = null;
  if (textContent) {
    try { data = JSON.parse(textContent); } catch (error) {}
  }
  return {
    success: true,
    league_id: leagueId,
    data: data || null,
    raw: data ? undefined : toolResult
  };
}


async function getSportApiMatchesTest(env, date, leagueId) {
  const endpoint = "https://sportapi.ai/mcp";
  const headers = {
    "X-Api-Key": env.SPORTAPI_KEY,
    "Accept": "application/json, text/event-stream",
    "Content-Type": "application/json"
  };
  const send = async payload => {
    const response = await fetch(endpoint, {
      method: "POST", headers, body: JSON.stringify(payload)
    });
    const body = await response.text();
    if (!response.ok) throw new Error("SportAPI MCP HTTP " + response.status);
    try {
      return body ? JSON.parse(body) : null;
    } catch (error) {
      const line = body.split("\\n").find(item => item.startsWith("data:"));
      if (line) return JSON.parse(line.slice(5).trim());
      throw new Error("Invalid SportAPI MCP response");
    }
  };

  const initialized = await send({
    jsonrpc: "2.0", id: 1, method: "initialize",
    params: {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "charara-sport-dz", version: "1.0.0" }
    }
  });
  if (!initialized?.result?.protocolVersion) {
    throw new Error("MCP initialization failed");
  }

  await send({ jsonrpc: "2.0", method: "notifications/initialized" });

  const result = await send({
    jsonrpc: "2.0", id: 2, method: "tools/call",
    params: {
      name: "get_matches",
      arguments: { date, league_id: leagueId, status: "finished" }
    }
  });

  if (result?.error) {
    throw new Error(result.error.message || "MCP get_matches failed");
  }

  const toolResult = result?.result || {};
  const content = toolResult.content?.find(item => item.type === "text")?.text;
  let data = null;
  if (content) {
    try { data = JSON.parse(content); } catch (error) {}
  }
  return {
    success: true,
    date,
    league_id: leagueId,
    data,
    raw: data ? undefined : toolResult
  };
}

async function getSportApiTeam(env, teamId) {
  const endpoint = "https://sportapi.ai/mcp";
  const headers = {
    "X-Api-Key": env.SPORTAPI_KEY,
    "Accept": "application/json, text/event-stream",
    "Content-Type": "application/json"
  };
  const send = async (payload) => {
    const response = await fetch(endpoint, {
      method: "POST", headers, body: JSON.stringify(payload)
    });
    const body = await response.text();
    if (!response.ok) throw new Error("SportAPI MCP HTTP " + response.status);
    return body ? JSON.parse(body) : null;
  };
  const initialized = await send({
    jsonrpc: "2.0", id: 1, method: "initialize",
    params: {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "charara-sport-dz", version: "1.0.0" }
    }
  });
  if (!initialized?.result?.protocolVersion) throw new Error("MCP initialization failed");
  await fetch(endpoint, {
    method: "POST", headers,
    body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" })
  });
  const result = await send({
    jsonrpc: "2.0", id: 2, method: "tools/call",
    params: { name: "get_team", arguments: { team_id: teamId } }
  });
  if (result?.error) throw new Error(result.error.message || "MCP get_team failed");
  const toolResult = result?.result || {};
  const textContent = toolResult.content?.find(item => item.type === "text")?.text;
  let data = null;
  if (textContent) {
    try { data = JSON.parse(textContent); } catch (error) {}
  }
  return { success: true, team_id: teamId, team: data, raw: data ? undefined : toolResult };
}

async function getSportApiHeadToHead(env, team1Id, team2Id) {
  const endpoint = "https://sportapi.ai/mcp";
  const headers = {
    "X-Api-Key": env.SPORTAPI_KEY,
    "Accept": "application/json, text/event-stream",
    "Content-Type": "application/json"
  };

  const send = async payload => {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });
    const body = await response.text();
    if (!response.ok) throw new Error("SportAPI MCP HTTP " + response.status);
    try {
      return body ? JSON.parse(body) : null;
    } catch (error) {
      const dataLine = body.split("\n").find(line => line.startsWith("data:"));
      if (dataLine) return JSON.parse(dataLine.slice(5).trim());
      throw new Error("Invalid SportAPI MCP response");
    }
  };

  const initialized = await send({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "charara-sport-dz", version: "1.0.0" }
    }
  });

  if (!initialized?.result?.protocolVersion) {
    throw new Error("MCP initialization failed");
  }

  await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "notifications/initialized"
    })
  });

  const result = await send({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "get_head_to_head",
      arguments: { team1_id: team1Id, team2_id: team2Id }
    }
  });

  if (result?.error) {
    throw new Error(result.error.message || "MCP H2H failed");
  }

  const toolResult = result?.result || {};
  const textContent = toolResult.content?.find(item => item.type === "text")?.text;
  let data = null;

  if (textContent) {
    try {
      data = JSON.parse(textContent);
    } catch (error) {}
  }

  const allMatches = Array.isArray(data?.data) ? data.data : [];
  const completedMatches = allMatches.filter(match =>
    ["FT", "AET", "PEN", "PENS"].includes(
      String(match.status || "").toUpperCase()
    )
  ).sort((a, b) =>
    String(b.date || "").localeCompare(String(a.date || ""))
  );

  return {
    success: true,
    team1_id: team1Id,
    team2_id: team2Id,
    matches: completedMatches,
    total: completedMatches.length
  };
}

function analyzeTeamForm(teamData, teamId) {
  const team = teamData?.team || {};
  const matches = Array.isArray(teamData?.matches) ? teamData.matches : [];
  const completed = matches.filter(match => {
    const status = String(match.status || "").toUpperCase();
    const league = String(match.league_name || "").toLowerCase();
    return ["FT", "AET", "PEN", "PENS"].includes(status) &&
      !league.includes("friendly") &&
      Number(match.league_id) !== 42234 &&
      Number.isFinite(Number(match.home_score)) &&
      Number.isFinite(Number(match.away_score)) &&
      (String(match.home_id) === String(teamId) ||
       String(match.away_id) === String(teamId));
  }).sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

  const last5 = completed.slice(0, 5).map(match => {
    const isHome = String(match.home_id) === String(teamId);
    const goalsFor = Number(isHome ? match.home_score : match.away_score);
    const goalsAgainst = Number(isHome ? match.away_score : match.home_score);
    return {
      id: match.id || null,
      date: match.date || null,
      opponent: isHome ? (match.away_team || match.away_name || null) : (match.home_team || match.home_name || null),
      venue: isHome ? "home" : "away",
      goals_for: goalsFor,
      goals_against: goalsAgainst,
      outcome: goalsFor > goalsAgainst ? "W" : goalsFor < goalsAgainst ? "L" : "D",
      league: match.league_name || null
    };
  });

  const total = last5.length;
  const sum = key => last5.reduce((n, match) => n + match[key], 0);
  const home = last5.filter(match => match.venue === "home");
  const away = last5.filter(match => match.venue === "away");
  const average = (items, key) => items.length
    ? Number((items.reduce((n, match) => n + match[key], 0) / items.length).toFixed(2))
    : null;

  const recencyWeights = [0.35, 0.25, 0.18, 0.13, 0.09];

  const weightedAverage = (items, key) => {
    let weightedSum = 0;
    let totalWeight = 0;

    for (const match of items) {
      const index = last5.indexOf(match);
      if (index < 0 || !Number.isFinite(match[key])) continue;
      const weight = recencyWeights[index];
      weightedSum += match[key] * weight;
      totalWeight += weight;
    }

    return totalWeight > 0
      ? Number((weightedSum / totalWeight).toFixed(3))
      : null;
  };

  return {
    team_id: teamId,
    team_name: team.name || null,
    sufficient_data: total === 5,
    message: total === 5 ? null : "بيانات غير كافية",
    played: total,
    wins: last5.filter(m => m.outcome === "W").length,
    draws: last5.filter(m => m.outcome === "D").length,
    losses: last5.filter(m => m.outcome === "L").length,
    goals_for: sum("goals_for"),
    goals_against: sum("goals_against"),
    avg_goals_for: average(last5, "goals_for"),
    avg_goals_against: average(last5, "goals_against"),
    weighted_avg_goals_for: weightedAverage(last5, "goals_for"),
    weighted_avg_goals_against: weightedAverage(last5, "goals_against"),
    home: {
      played: home.length,
      avg_goals_for: average(home, "goals_for"),
      avg_goals_against: average(home, "goals_against"),
      weighted_avg_goals_for: weightedAverage(home, "goals_for"),
      weighted_avg_goals_against: weightedAverage(home, "goals_against")
    },
    away: {
      played: away.length,
      avg_goals_for: average(away, "goals_for"),
      avg_goals_against: average(away, "goals_against"),
      weighted_avg_goals_for: weightedAverage(away, "goals_for"),
      weighted_avg_goals_against: weightedAverage(away, "goals_against")
    },
    last5
  };
}

function predictMatch(homeData, awayData, homeTeamId, awayTeamId) {
  const home = analyzeTeamForm(homeData, homeTeamId);
  const away = analyzeTeamForm(awayData, awayTeamId);

  if (!home.sufficient_data || !away.sufficient_data) {
    return {
      success: false,
      sufficient_data: false,
      message: "بيانات غير كافية لإصدار توقع موثوق",
      home_team: home.team_name,
      away_team: away.team_name,
      home_matches: home.played,
      away_matches: away.played
    };
  }

  const blendVenueWithOverall = (overall, venue, venueMatches) => {
    if (!Number.isFinite(venue) || !Number.isFinite(overall) || venueMatches <= 0) {
      return overall;
    }

    const venueWeight = venueMatches / (venueMatches + 3);
    return overall * (1 - venueWeight) + venue * venueWeight;
  };

  const homeAttack = blendVenueWithOverall(
    home.weighted_avg_goals_for,
    home.home.weighted_avg_goals_for,
    home.home.played
  );

  const homeDefense = blendVenueWithOverall(
    home.weighted_avg_goals_against,
    home.home.weighted_avg_goals_against,
    home.home.played
  );

  const awayAttack = blendVenueWithOverall(
    away.weighted_avg_goals_for,
    away.away.weighted_avg_goals_for,
    away.away.played
  );

  const awayDefense = blendVenueWithOverall(
    away.weighted_avg_goals_against,
    away.away.weighted_avg_goals_against,
    away.away.played
  );

  const expectedHomeGoals = Math.max(0.05, (homeAttack + awayDefense) / 2);
  const expectedAwayGoals = Math.max(0.05, (awayAttack + homeDefense) / 2);

  const poisson = (lambda, goals) => {
    let factorial = 1;
    for (let i = 2; i <= goals; i++) factorial *= i;
    return Math.exp(-lambda) * Math.pow(lambda, goals) / factorial;
  };

  const maxGoals = 10;
  const matrix = [];
  let totalProbability = 0;

  for (let h = 0; h <= maxGoals; h++) {
    matrix[h] = [];
    for (let a = 0; a <= maxGoals; a++) {
      const probability = poisson(expectedHomeGoals, h) *
        poisson(expectedAwayGoals, a);
      matrix[h][a] = probability;
      totalProbability += probability;
    }
  }

  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;
  let best = { home: 0, away: 0, probability: -1 };

  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      const probability = matrix[h][a] / totalProbability;
      if (h > a) homeWin += probability;
      else if (h === a) draw += probability;
      else awayWin += probability;
      if (probability > best.probability) {
        best = { home: h, away: a, probability };
      }
    }
  }

  const percent = value => Number((value * 100).toFixed(1));

  return {
    success: true,
    sufficient_data: true,
    model: "Poisson",
    home_team: home.team_name,
    away_team: away.team_name,
    expected_goals: {
      home: Number(expectedHomeGoals.toFixed(2)),
      away: Number(expectedAwayGoals.toFixed(2))
    },
    probabilities: {
      home_win: percent(homeWin),
      draw: percent(draw),
      away_win: percent(awayWin)
    },
    predicted_score: best.home + "-" + best.away,
    score_probability: percent(best.probability),
    sample_size: {
      home_team: home.played,
      away_team: away.played
    },
    venue_data: {
      home_team_home_matches: home.home.played,
      away_team_away_matches: away.away.played
    },
    note: "توقع إحصائي تقديري وليس ضمانًا للنتيجة"
  };
}

function getFixture(raw) {
  return raw?.data?.fixture || raw?.fixture || raw?.data || raw;
}

function statusCode(status) {
  const value = String(status || "").toLowerCase();

  const map = {
    scheduled: "NS",
    not_started: "NS",
    live: "LIVE",
    "first half": "1H",
    first_half: "1H",
    halftime: "HT",
    half_time: "HT",
    "second half": "2H",
    second_half: "2H",
    finished: "FT",
    ft: "FT",
    aet: "AET",
    pens: "PEN",
    postponed: "PST",
    cancelled: "CANC",
    canceled: "CANC",
    suspended: "SUSP"
  };

  return map[value] || String(status || "NS").toUpperCase();
}

function convertFixture(item, origin = '') {
  const f = item?.fixture || item;

  return {
    fixture: {
      id: f.id,
      date: f.datetime || f.date || "",
      status: {
        short: statusCode(f.status),
        long: String(f.status || "")
      },
      venue: { name: "" }
    },
    league: {
      id: f.league_id || null,
      name: f.league_name || ""
    },
    teams: {
      home: {
        id: f.home_id || null,
        name: f.home_team || f.home_name || "",
        logo: f.home_id ? origin + "/teams/" + f.home_id + "/logo" : ""
      },
      away: {
        id: f.away_id || null,
        name: f.away_team || f.away_name || "",
        logo: f.away_id ? origin + "/teams/" + f.away_id + "/logo" : ""
      }
    },
    goals: {
      home: f.home_score ?? null,
      away: f.away_score ?? null
    }
  };
}

async function getFixtureDetails(id, env) {
  const raw = await getSportData(
    `/fixtures/${encodeURIComponent(id)}`,
    env,
    CACHE_TTL.details
  );

  return getFixture(raw);
}

function convertEvents(rawEvents, fixture) {
  const events = Array.isArray(rawEvents) ? rawEvents : [];

  return events.map(event => {
    const side = String(event.team_side || "").toLowerCase();
    const isHome = side === "home";

    return {
      time: {
        elapsed: Number.parseInt(event.minute, 10) || 0,
        extra: null
      },
      team: {
        id: isHome ? fixture.home_id : side === "away" ? fixture.away_id : null,
        name: isHome
          ? fixture.home_team || ""
          : side === "away"
            ? fixture.away_team || ""
            : ""
      },
      type: String(event.event_type || "Other"),
      detail: String(event.extra_info || ""),
      player: {
        id: null,
        name: String(event.player_name || "")
      },
      assist: {
        id: null,
        name: ""
      }
    };
  });
}

function convertLineups(raw, fixture) {
  const data = raw?.data || raw || {};

  return ["home", "away"].map(side => {
    const team = side === "home"
      ? {
          id: fixture.home_id || null,
          name: fixture.home_team || "الفريق الأول"
        }
      : {
          id: fixture.away_id || null,
          name: fixture.away_team || "الفريق الثاني"
        };

    const source = data[side] || {};

    const convertPlayer = player => {
      const position = String(player.position || "").toUpperCase();

      let pos = position;
      if (/goalkeeper|keeper|^gk$/.test(position)) pos = "G";
      else if (/defender|defence|^d$/.test(position)) pos = "D";
      else if (/midfielder|midfield|^m$/.test(position)) pos = "M";
      else if (/forward|striker|attacker|^f$/.test(position)) pos = "F";

      return {
        player: {
          id: player.id || null,
          name: player.name || "لاعب",
          number: player.shirt ?? null,
          pos,
          grid: null
        }
      };
    };

    return {
      team,
      formation: source.formation || "",
      coach: { name: source.coach || "" },
      startXI: (source.starters || []).map(convertPlayer),
      substitutes: (source.subs || []).map(convertPlayer)
    };
  }).filter(lineup =>
    lineup.startXI.length > 0 || lineup.substitutes.length > 0
  );
}

function convertStatistics(raw, fixture) {
  const data = raw?.data || {};

  const fields = {
    shots: "Total Shots",
    shots_on_target: "Shots on Goal",
    shots_off_target: "Shots off Goal",
    fouls: "Fouls",
    total_passes: "Total Passes",
    pass_accuracy: "Passes %",
    tackles: "Tackles",
    tackle_success: "Tackle Success",
    saves: "Goalkeeper Saves",
    yellow_cards: "Yellow Cards",
    red_cards: "Red Cards",
    corners: "Corner Kicks",
    offsides: "Offsides",
    possession: "Ball Possession"
  };

  return ["home", "away"].map(side => {
    const source = data[side] || {};
    const team = side === "home"
      ? {
          id: fixture.home_id || null,
          name: fixture.home_team || "الفريق الأول"
        }
      : {
          id: fixture.away_id || null,
          name: fixture.away_team || "الفريق الثاني"
        };

    const statistics = Object.entries(fields)
      .filter(([key]) => source[key] !== undefined && source[key] !== null)
      .map(([key, type]) => ({
        type,
        value: source[key]
      }));

    return { team, statistics };
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS
      });
    }

    if (request.method !== "GET") {
      return json({ success: false, error: "Method not allowed" }, 405);
    }

    if (!env.SPORTAPI_KEY) {
      return json({
        success: false,
        error: "API key is not configured"
      }, 500);
    }

    const path = url.pathname.replace(/\/+$/, "");

    try {
      if (path === "/mcp-tools") {
        const result = await inspectSportApiMcp(env);
        return json({ success: true, mcp: result });
      }

      if (path === "/mcp-matches-test") {
        const date = new URL(request.url).searchParams.get("date") || "2026-10-25";
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return json({ success: false, error: "Invalid date. Use YYYY-MM-DD" }, 400);
        }
        const result = await getSportApiMatchesTest(env, date, 68117);
        return json(result);
      }

      if (path === "/mcp-league-test") {
        const result = await getSportApiLeague(env, 68117);
        return json(result);
      }

      if (path === "/leagues") {
        const data = await getSportData(
          "/standings/leagues",
          env,
          CACHE_TTL.leagues
        );
        return json(data);
      }

      const standingsMatch = path.match(/^\/standings\/([0-9]+)$/);

      if (standingsMatch) {
        const leagueId = standingsMatch[1];

        if (!ALLOWED_LEAGUES.has(leagueId)) {
          return json({
            success: false,
            error: "League is not allowed"
          }, 403);
        }

        const data = await getSportData(
          `/standings/${leagueId}`,
          env,
          CACHE_TTL.standings
        );

        return json(data);
      }


      const leagueFixturesMatch = path.match(/^\/league-fixtures\/([0-9]+)$/);

      if (leagueFixturesMatch) {
        const leagueId = leagueFixturesMatch[1];

        if (!ALLOWED_LEAGUES.has(leagueId)) {
          return json({
            success: false,
            error: "League is not allowed"
          }, 403);
        }

        const raw = await getSportData(
          `/leagues/${leagueId}`,
          env,
          CACHE_TTL.fixtures
        );

        const leagueData = raw?.data?.league || raw?.data || raw;
        const upcoming = Array.isArray(leagueData?.upcoming_fixtures)
          ? leagueData.upcoming_fixtures
          : Array.isArray(raw?.upcoming_fixtures)
            ? raw.upcoming_fixtures
            : [];

        const recent = Array.isArray(leagueData?.recent_results)
          ? leagueData.recent_results
          : Array.isArray(raw?.recent_results)
            ? raw.recent_results
            : [];

        return json({
          success: true,
          league: {
            id: leagueData?.id || raw?.id || leagueId,
            name: leagueData?.name || raw?.name || ""
          },
          data: {
            upcoming_fixtures: upcoming,
            recent_results: recent
          }
        });
      }

      const playerSlugMatch = path.match(/^\/players\/slug\/([a-z0-9-]+)$/i);

      if (playerSlugMatch) {
        const slug = playerSlugMatch[1].toLowerCase();

        const data = await getSportData(
          `/players/${encodeURIComponent(slug)}`,
          env,
          CACHE_TTL.players
        );

        return json(data);
      }

      const teamLogoMatch = path.match(/^\/teams\/([0-9]+)\/logo$/);

      if (teamLogoMatch) {
        const teamId = teamLogoMatch[1];
        const cacheKey = new Request(
          "https://charara-sport-cache.local/teams/" + teamId + "/logo"
        );
        const cache = caches.default;
        const cachedLogo = await cache.match(cacheKey);
        if (cachedLogo) return cachedLogo;

        const upstream = await fetch(
          SPORT_API + "/teams/" + teamId + "/logo",
          {
            headers: {
              "X-Api-Key": env.SPORTAPI_KEY,
              "Accept": "image/*"
            }
          }
        );

        if (!upstream.ok) {
          return json({
            success: false,
            error: "Team logo unavailable",
            status: upstream.status
          }, upstream.status);
        }

        const imageHeaders = new Headers(CORS_HEADERS);
        imageHeaders.set(
          "Content-Type",
          upstream.headers.get("Content-Type") || "image/png"
        );
        imageHeaders.set("Cache-Control", "public, max-age=86400");

        const logoResponse = new Response(upstream.body, {
          status: 200,
          headers: imageHeaders
        });

        await cache.put(cacheKey, logoResponse.clone());
        return logoResponse;
      }

      if (path === "/teams/search") {
        const query = (url.searchParams.get("query") || "").trim();
        const requestedLimit = Number(url.searchParams.get("limit") || 10);
        if (query.length < 2) {
          return json({ success: false, error: "Query must contain at least 2 characters" }, 400);
        }
        const limit = Number.isInteger(requestedLimit)
          ? Math.min(50, Math.max(1, requestedLimit))
          : 10;
        const result = await searchSportApiTeams(env, query, limit);
        return json(result);
      }
      const teamFormMatch = path.match(/^\/teams\/form\/([0-9]+)$/);
      if (teamFormMatch) {
        const teamId = Number(teamFormMatch[1]);
        const result = await getSportApiTeam(env, teamId);
        if (!result?.success || !result.team) {
          return json({ success: false, error: "Team data unavailable" }, 502);
        }
        const analysis = analyzeTeamForm(result.team, teamId);
        return json({ success: true, ...analysis });
      }

      const teamDetailsMatch = path.match(/^\/teams\/details\/([0-9]+)$/);
      if (teamDetailsMatch) {
        const teamId = Number(teamDetailsMatch[1]);
        const result = await getSportApiTeam(env, teamId);
        return json(result);
      }

      if (path === "/predictions") {
        const homeId = Number(url.searchParams.get("home"));
        const awayId = Number(url.searchParams.get("away"));
        if (!Number.isSafeInteger(homeId) || homeId <= 0 ||
            !Number.isSafeInteger(awayId) || awayId <= 0 || homeId === awayId) {
          return json({ success: false, error: "Invalid home or away team ID" }, 400);
        }
        const [homeResult, awayResult] = await Promise.all([
          getSportApiTeam(env, homeId),
          getSportApiTeam(env, awayId)
        ]);
        if (!homeResult?.success || !homeResult.team ||
            !awayResult?.success || !awayResult.team) {
          return json({ success: false, error: "Team data unavailable" }, 502);
        }
        const prediction = predictMatch(
          homeResult.team, awayResult.team, homeId, awayId
        );

        if (url.searchParams.get("h2h") === "1" && prediction.success) {
          try {
            prediction.head_to_head = await getSportApiHeadToHead(
              env, homeId, awayId
            );
          } catch (error) {
            prediction.head_to_head = {
              success: false,
              message: "تعذر جلب بيانات المواجهات المباشرة"
            };
          }
        }

        return json(prediction);
      }

      const teamIdMatch = path.match(/^\/teams\/([0-9]+)$/);

      if (teamIdMatch) {
        const teamId = teamIdMatch[1];

        const data = await getSportData(
          `/teams/${encodeURIComponent(teamId)}`,
          env,
          CACHE_TTL.teams
        );

        return json(data);
      }

      const teamSlugMatch = path.match(/^\/teams\/slug\/([a-z0-9-]+)$/i);

      if (teamSlugMatch) {
        const slug = teamSlugMatch[1].toLowerCase();

        const data = await getSportData(
          `/teams/slug/${encodeURIComponent(slug)}`,
          env,
          CACHE_TTL.teams
        );

        return json(data);
      }

      if (path === "/fixtures" && url.searchParams.has("date")) {
        const date = url.searchParams.get("date");

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return json({
            success: false,
            error: "Invalid date format"
          }, 400);
        }

        const raw = await getSportData(
          `/fixtures/date/${date}`,
          env,
          CACHE_TTL.fixtures
        );

        const fixtures = Array.isArray(raw.data) ? raw.data : [];

        return json({
          success: true,
          data: {
            response: fixtures.map(item => convertFixture(item, url.origin))
          }
        });
      }

      if (path === "/fixtures" && url.searchParams.has("id")) {
        const id = url.searchParams.get("id");
        const fixture = await getFixtureDetails(id, env);

        return json({
          success: true,
          data: {
            response: [convertFixture(fixture, url.origin)]
          }
        });
      }

      if (path === "/fixtures/players") {
        return json({
          success: true,
          data: { response: [] },
          message: "Player ratings are not provided by this source"
        });
      }

      const fixtureQuery = url.searchParams.get("fixture");

      if (
        fixtureQuery &&
        ["/fixtures/events", "/fixtures/lineups", "/fixtures/statistics"].includes(path)
      ) {
        const fixture = await getFixtureDetails(fixtureQuery, env);

        if (path === "/fixtures/events") {
          const raw = await getSportData(
            `/fixtures/${encodeURIComponent(fixtureQuery)}/events`,
            env,
            CACHE_TTL.events
          );

          return json({
            success: true,
            data: {
              response: convertEvents(raw.data, fixture)
            }
          });
        }

        if (path === "/fixtures/lineups") {
          const raw = await getSportData(
            `/fixtures/${encodeURIComponent(fixtureQuery)}/lineups`,
            env,
            CACHE_TTL.lineups
          );

          return json({
            success: true,
            data: {
              response: convertLineups(raw, fixture)
            }
          });
        }

        if (path === "/fixtures/statistics") {
          const raw = await getSportData(
            `/fixtures/${encodeURIComponent(fixtureQuery)}/stats`,
            env,
            CACHE_TTL.statistics
          );

          return json({
            success: true,
            data: {
              response: convertStatistics(raw, fixture)
            }
          });
        }
      }

      return json({
        success: false,
        error: "Unknown endpoint"
      }, 404);

    } catch (error) {
      return json({
        success: false,
        error: "Unable to process SportAPI request",
        details: error.message
      }, 502);
    }
  }
};
