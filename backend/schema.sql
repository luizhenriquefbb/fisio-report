CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

insert or replace into "users" (id, email, password_hash) values (1, 'admin@gmail.com', 'adueweuqlsd12');

CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    photo TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

INSERT or replace INTO "players" (id, user_id, name, position) VALUES(1, 1,'Joao','Atacante');

CREATE TABLE IF NOT EXISTS status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    color TEXT
);

INSERT or ignore INTO "status" VALUES(1, 1, 'NO DM','#EF4444');
INSERT or ignore INTO "status" VALUES(2, 1, 'TRANSIÇÃO','#F59E0B');
INSERT or ignore INTO "status" VALUES(3, 1, 'LIBERADO','#10B981');


CREATE TABLE IF NOT EXISTS shifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

insert or replace into "shifts" (id, user_id, name) values (1, 1, 'Manhã');

CREATE TABLE IF NOT EXISTS treatments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

INSERT or replace INTO "treatments" (id, user_id, name) VALUES (1, 1, 'Fisioterapia');
CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

INSERT or replace INTO "complaints" (id, user_id, name) VALUES (1, 1, 'Dor muscular');

CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    player_id INTEGER NOT NULL,
    complaint_id INTEGER NOT NULL,
    shift_id INTEGER NOT NULL,
    treatment_id INTEGER NOT NULL,
    status_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    observation TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(player_id) REFERENCES players(id),
    FOREIGN KEY(complaint_id) REFERENCES complaints(id),
    FOREIGN KEY(shift_id) REFERENCES shifts(id),
    FOREIGN KEY(treatment_id) REFERENCES treatments(id),
    FOREIGN KEY(status_id) REFERENCES status(id)
);
