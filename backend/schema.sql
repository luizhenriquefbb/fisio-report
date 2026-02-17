CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

insert into "users" (email, password_hash) values ('admin@gmail.com', 'adueweuqlsd12');

CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    photo TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

INSERT INTO "players" (user_id, name, position) VALUES(1,'Joao','Atacante');

CREATE TABLE IF NOT EXISTS status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT
);

INSERT INTO "status" VALUES(1,'NO DM','#EF4444');
INSERT INTO "status" VALUES(2,'TRANSIÇÃO','#F59E0B');
INSERT INTO "status" VALUES(3,'LIBERADO','#10B981');


CREATE TABLE IF NOT EXISTS shifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

insert into "shifts" (user_id, name) values (1, 'Manhã');

CREATE TABLE IF NOT EXISTS treatments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

INSERT INTO "treatments" (user_id, name) VALUES (1, 'Fisioterapia');

CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

INSERT INTO "complaints" (user_id, name) VALUES (1, 'Dor muscular');

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
