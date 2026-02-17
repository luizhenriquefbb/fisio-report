import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import { sign } from 'hono/jwt';
import { logger } from 'hono/logger';

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

// Type definitions matching the database schema
interface User {
  id: number;
  email: string;
  password_hash: string;
}

const app = new Hono<{ Bindings: Env; Variables: { userPayload: { user_id: number } } }>();

// Global Middleware
app.use('*', logger());
app.use('/api/*', cors());

// Error Handler
app.onError((err, c) => {
  console.error(`[ERROR] ${c.req.method} ${c.req.path}:`, err);
  return c.json({ error: err.message || 'Internal Server Error' }, 500);
});

// JWT Middleware for protected routes
app.use('/api/*', async (c, next) => {
  const publicPaths = ['/api/auth/login', '/api/auth/register'];
  if (publicPaths.includes(c.req.path)) {
    console.log(`[AUTH] Public path access: ${c.req.path}`);
    return next();
  }

  console.log(`[AUTH] Protected path access: ${c.req.path}`);
  try {
    const jwtMiddleware = jwt({ secret: c.env.JWT_SECRET, alg: 'HS256' });
    return await jwtMiddleware(c, next);
  } catch (err) {
    console.error(`[AUTH] JWT Verification failed:`, err);
    throw err;
  }
});

// Helper to get user ID from context
const getUserId = (c: any) => {
  const payload = c.get('jwtPayload');
  console.log(`[CONTEXT] JWT Payload:`, payload);
  return payload ? payload.user_id : null;
};

// --- Auth Routes ---

// app.post('/api/auth/register', async (c) => {
//   const { email, password } = await c.req.json();
//   console.log(`[AUTH] Registering user: ${email}`);

//   if (!email || !password) {
//     return c.json({ error: 'Email and password required' }, 400);
//   }

//   try {
//     console.log(`[DB] Inserting user: ${email}`);
//     const result = await c.env.DB.prepare(
//       "INSERT INTO users (email, password_hash) VALUES (?, ?)"
//     ).bind(email, password).run();
//     console.log(`[DB] User created result:`, result);

//     return c.json({ message: 'User created' });
//   } catch (e: any) {
//     console.error(`[DB] Registration failed:`, e);
//     return c.json({ error: 'User already exists or error' }, 400);
//   }
// });

app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json();
  console.log(`[AUTH] Login attempt: ${email}`);

  try {
    console.log(`[DB] Querying user: ${email}`);
    const user = await c.env.DB.prepare(
      "SELECT * FROM users WHERE email = ? AND password_hash = ?"
    ).bind(email, password).first<User>();
    console.log(`[DB] User query result:`, user ? 'Found' : 'Not Found');

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const token = await sign({
      user_id: user.id,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 days
    }, c.env.JWT_SECRET, 'HS256');
    console.log(`[AUTH] Token generated for user ID: ${user.id}`);

    return c.json({ token });
  } catch (e: any) {
    console.error(`[DB] Login query failed:`, e);
    throw e;
  }
});

// --- Dashboard ---

app.get('/api/dashboard', async (c) => {
  const userId = getUserId(c);
  const date = c.req.query('date');
  console.log(`[DASHBOARD] Fetching for UserID: ${userId}, Date: ${date}`);

  if (!date) {
    return c.json({ error: 'Date required' }, 400);
  }

  const query = `
    SELECT
        r.id, r.player_id, p.name as player_name, p.position, p.photo,
        r.complaint_id, c.name as complaint,
        r.shift_id, s.name as shift,
        r.treatment_id, t.name as treatment,
        r.status_id, st.name as status, st.color as status_color,
        r.observation
    FROM records r
    JOIN players p ON r.player_id = p.id
    JOIN complaints c ON r.complaint_id = c.id
    JOIN shifts s ON r.shift_id = s.id
    JOIN treatments t ON r.treatment_id = t.id
    JOIN status st ON r.status_id = st.id
    WHERE r.user_id = ? AND r.date = ?
    ORDER BY r.id DESC
  `;

  try {
    console.log(`[DB] Executing dashboard query...`);
    const { results } = await c.env.DB.prepare(query).bind(userId, date).all();
    console.log(`[DB] Dashboard results count: ${results.length}`);

    // Map to camelCase
    const data = results.map((row: any) => ({
      id: row.id,
      playerId: row.player_id,
      name: row.player_name,
      position: row.position,
      photo: row.photo,
      complaintId: row.complaint_id,
      complaint: row.complaint,
      shiftId: row.shift_id,
      period: row.shift,
      treatmentId: row.treatment_id,
      treatment: row.treatment,
      statusId: row.status_id,
      status: row.status,
      statusColor: row.status_color,
      observation: row.observation
    }));

    return c.json(data);
  } catch (e: any) {
    console.error(`[DB] Dashboard query failed:`, e);
    throw e;
  }
});

// --- Lookup ---

app.get('/api/lookup', async (c) => {
  const userId = getUserId(c);
  console.log(`[LOOKUP] Fetching options for UserID: ${userId}`);

  try {
    const [players, complaints, shifts, treatments, status] = await Promise.all([
      c.env.DB.prepare("SELECT id, name, position, photo FROM players WHERE user_id = ? ORDER BY name").bind(userId).all(),
      c.env.DB.prepare("SELECT id, name FROM complaints WHERE user_id = ? ORDER BY name").bind(userId).all(),
      c.env.DB.prepare("SELECT id, name FROM shifts WHERE user_id = ?").bind(userId).all(),
      c.env.DB.prepare("SELECT id, name FROM treatments WHERE user_id = ? ORDER BY name").bind(userId).all(),
      c.env.DB.prepare("SELECT id, name, color FROM status").all(),
    ]);
    console.log(`[DB] Lookup data fetched successfully`);

    return c.json({
      players: players.results,
      complaints: complaints.results,
      shifts: shifts.results,
      treatments: treatments.results,
      status: status.results
    });
  } catch (e: any) {
    console.error(`[DB] Lookup query failed:`, e);
    throw e;
  }
});

// --- Records CRUD ---

app.post('/api/records', async (c) => {
  const userId = getUserId(c);
  const body = await c.req.json();
  console.log(`[RECORDS] Creating record for UserID: ${userId}`, body);

  try {
    const recordDate = body.date || new Date().toISOString().split('T')[0];
    const result = await c.env.DB.prepare(`
      INSERT INTO records (user_id, player_id, complaint_id, shift_id, treatment_id, status_id, date, observation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      userId,
      body.playerId, body.complaintId, body.shiftId,
      body.treatmentId, body.statusId, recordDate, body.observation
    ).run();
    console.log(`[DB] Record created:`, result);

    return c.json({ message: 'Created' });
  } catch (e: any) {
    console.error(`[DB] Record creation failed:`, e);
    throw e;
  }
});

app.put('/api/records/:id', async (c) => {
  const userId = getUserId(c);
  const id = c.req.param('id');
  const body = await c.req.json();
  console.log(`[RECORDS] Updating record ID: ${id} for UserID: ${userId}`, body);

  try {
    const result = await c.env.DB.prepare(`
      UPDATE records SET
          player_id = ?, complaint_id = ?, shift_id = ?,
          treatment_id = ?, status_id = ?, observation = ?
      WHERE id = ? AND user_id = ?
    `).bind(
      body.playerId, body.complaintId, body.shiftId,
      body.treatmentId, body.statusId, body.observation,
      id, userId
    ).run();
    console.log(`[DB] Record updated result:`, result);

    return c.json({ message: 'Updated' });
  } catch (e: any) {
    console.error(`[DB] Record update failed:`, e);
    throw e;
  }
});

app.delete('/api/records/:id', async (c) => {
  const userId = getUserId(c);
  const id = c.req.param('id');
  console.log(`[RECORDS] Deleting record ID: ${id} for UserID: ${userId}`);

  try {
    const result = await c.env.DB.prepare("DELETE FROM records WHERE id = ? AND user_id = ?")
      .bind(id, userId).run();
    console.log(`[DB] Record deleted result:`, result);

    return c.json({ message: 'Deleted' });
  } catch (e: any) {
    console.error(`[DB] Record deletion failed:`, e);
    throw e;
  }
});

// --- Players CRUD ---

app.get('/api/players', async (c) => {
  const userId = getUserId(c);
  console.log(`[PLAYERS] Fetching for UserID: ${userId}`);
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM players WHERE user_id = ? ORDER BY name"
    ).bind(userId).all();
    return c.json(results);
  } catch (e: any) {
    console.error(`[DB] Players fetch failed:`, e);
    throw e;
  }
});

app.post('/api/players', async (c) => {
  const userId = getUserId(c);
  const body = await c.req.json();
  console.log(`[PLAYERS] Creating for UserID: ${userId}`, body);

  try {
    const result = await c.env.DB.prepare(
      "INSERT INTO players (user_id, name, position, photo) VALUES (?, ?, ?, ?)"
    ).bind(userId, body.name, body.position, body.photo || null).run();
    console.log(`[DB] Player created result:`, result);
    return c.json({ message: 'Created' });
  } catch (e: any) {
    console.error(`[DB] Player creation failed:`, e);
    throw e;
  }
});

app.put('/api/players/:id', async (c) => {
  const userId = getUserId(c);
  const id = c.req.param('id');
  const body = await c.req.json();
  console.log(`[PLAYERS] Updating ID: ${id} for UserID: ${userId}`, body);

  try {
    const result = await c.env.DB.prepare(
      "UPDATE players SET name = ?, position = ?, photo = ? WHERE id = ? AND user_id = ?"
    ).bind(body.name, body.position, body.photo || null, id, userId).run();
    console.log(`[DB] Player updated result:`, result);
    return c.json({ message: 'Updated' });
  } catch (e: any) {
    console.error(`[DB] Player update failed:`, e);
    throw e;
  }
});

app.delete('/api/players/:id', async (c) => {
  const userId = getUserId(c);
  const id = c.req.param('id');
  console.log(`[PLAYERS] Deleting ID: ${id} for UserID: ${userId}`);

  try {
    const count = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM records WHERE player_id = ? AND user_id = ?"
    ).bind(id, userId).first<any>();

    if (count && count.count > 0) {
      console.log(`[PLAYERS] Delete blocked: ${count.count} records linked to player ${id}`);
      return c.json({ error: `Cannot delete player with ${count.count} records` }, 400);
    }

    const result = await c.env.DB.prepare(
      "DELETE FROM players WHERE id = ? AND user_id = ?"
    ).bind(id, userId).run();
    console.log(`[DB] Player deleted result:`, result);
    return c.json({ message: 'Deleted' });
  } catch (e: any) {
    console.error(`[DB] Player deletion failed:`, e);
    throw e;
  }
});

// --- Other Catalog CRUDs (Complaints, Treatments, Shifts) ---
const handleCatalogCrud = (table: string) => {
  app.get(`/api/${table}`, async (c) => {
    const userId = getUserId(c);
    console.log(`[CATALOG][${table}] Fetching for UserID: ${userId}`);
    try {
      const { results } = await c.env.DB.prepare(`SELECT * FROM ${table} WHERE user_id = ? ORDER BY name`).bind(userId).all();
      return c.json(results);
    } catch (e: any) {
      console.error(`[DB][${table}] Fetch failed:`, e);
      throw e;
    }
  });

  app.post(`/api/${table}`, async (c) => {
    const userId = getUserId(c);
    const body = await c.req.json();
    console.log(`[CATALOG][${table}] Creating for UserID: ${userId}`, body);
    try {
      const result = await c.env.DB.prepare(`INSERT INTO ${table} (user_id, name) VALUES (?, ?)`).bind(userId, body.name).run();
      console.log(`[DB][${table}] Created result:`, result);
      return c.json({ message: 'Created' });
    } catch (e: any) {
      console.error(`[DB][${table}] Creation failed:`, e);
      throw e;
    }
  });

  app.put(`/api/${table}/:id`, async (c) => {
    const userId = getUserId(c);
    const id = c.req.param('id');
    const body = await c.req.json();
    console.log(`[CATALOG][${table}] Updating ID: ${id} for UserID: ${userId}`, body);
    try {
      const result = await c.env.DB.prepare(`UPDATE ${table} SET name = ? WHERE id = ? AND user_id = ?`).bind(body.name, id, userId).run();
      console.log(`[DB][${table}] Updated result:`, result);
      return c.json({ message: 'Updated' });
    } catch (e: any) {
      console.error(`[DB][${table}] Update failed:`, e);
      throw e;
    }
  });

  app.delete(`/api/${table}/:id`, async (c) => {
    const userId = getUserId(c);
    const id = c.req.param('id');
    console.log(`[CATALOG][${table}] Deleting ID: ${id} for UserID: ${userId}`);

    try {
      const fkColumn = table.slice(0, -1) + '_id';
      const count = await c.env.DB.prepare(`SELECT COUNT(*) as count FROM records WHERE ${fkColumn} = ? AND user_id = ?`).bind(id, userId).first<any>();

      if (count && count.count > 0) {
        console.log(`[CATALOG][${table}] Delete blocked: ${count.count} records linked`);
        return c.json({ error: `Cannot delete item with ${count.count} records` }, 400);
      }

      const result = await c.env.DB.prepare(`DELETE FROM ${table} WHERE id = ? AND user_id = ?`).bind(id, userId).run();
      console.log(`[DB][${table}] Deleted result:`, result);
      return c.json({ message: 'Deleted' });
    } catch (e: any) {
      console.error(`[DB][${table}] Deletion failed:`, e);
      throw e;
    }
  });
};

handleCatalogCrud('complaints');
handleCatalogCrud('shifts');
handleCatalogCrud('treatments');

// --- Reports ---

app.get('/api/reports', async (c) => {
  const userId = getUserId(c);
  const dateFilter = c.req.query('date');
  console.log(`[REPORTS] Fetching summaries for UserID: ${userId}, Filter: ${dateFilter}`);

  let query = "SELECT date, COUNT(*) as count FROM records WHERE user_id = ? ";
  const params: any[] = [userId];

  if (dateFilter) {
    query += "AND date = ? ";
    params.push(dateFilter);
  }

  query += "GROUP BY date ORDER BY date DESC";

  try {
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    return c.json(results);
  } catch (e: any) {
    console.error(`[DB] Reports fetch failed:`, e);
    throw e;
  }
});

app.get('/api/reports/stats', async (c) => {
  const userId = getUserId(c);
  console.log(`[REPORTS] Fetching stats for UserID: ${userId}`);

  try {
    const [total, monthStats, days] = await Promise.all([
      c.env.DB.prepare("SELECT COUNT(*) as count FROM records WHERE user_id = ?").bind(userId).first<any>(),
      c.env.DB.prepare(
        "SELECT COUNT(DISTINCT date) as count FROM records WHERE user_id = ? AND strftime('%m', date) = strftime('%m', 'now') AND strftime('%Y', date) = strftime('%Y', 'now')"
      ).bind(userId).first<any>(),
      c.env.DB.prepare("SELECT COUNT(DISTINCT date) as count FROM records WHERE user_id = ?").bind(userId).first<any>()
    ]);

    const totalRecords = total?.count || 0;
    const distinctDays = days?.count || 1;
    const average = distinctDays > 0 ? totalRecords / distinctDays : 0;

    return c.json({
      totalRecords,
      reportsThisMonth: monthStats?.count || 0,
      averagePerDay: Math.round(average * 10) / 10
    });
  } catch (e: any) {
    console.error(`[DB] Stats fetch failed:`, e);
    throw e;
  }
});

export default app;
