-- Create tables for the adventure clicker game

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  coins INTEGER NOT NULL DEFAULT 0,
  damage FLOAT NOT NULL DEFAULT 1,
  auto_damage FLOAT NOT NULL DEFAULT 0,
  current_area TEXT NOT NULL DEFAULT 'ป่า',
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  xp_required INTEGER NOT NULL DEFAULT 100,
  last_login TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  damage FLOAT NOT NULL DEFAULT 1,
  image TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'item',
  rarity TEXT NOT NULL DEFAULT 'common',
  image TEXT,
  token_id TEXT,
  minted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Upgrades table
CREATE TABLE IF NOT EXISTS upgrades (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL UNIQUE REFERENCES players(id) ON DELETE CASCADE,
  auto_battle BOOLEAN NOT NULL DEFAULT FALSE,
  inventory_slots INTEGER NOT NULL DEFAULT 10,
  damage_multiplier FLOAT NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Quests table
CREATE TABLE IF NOT EXISTS quests (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reward INTEGER NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  target INTEGER NOT NULL,
  type TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  area_required TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Battle history table
CREATE TABLE IF NOT EXISTS battle_history (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  area TEXT NOT NULL,
  monsters_defeated INTEGER NOT NULL DEFAULT 0,
  coins_earned INTEGER NOT NULL DEFAULT 0,
  items_found INTEGER NOT NULL DEFAULT 0,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Player activities table
CREATE TABLE IF NOT EXISTS player_activities (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_players_timestamp
BEFORE UPDATE ON players
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_characters_timestamp
BEFORE UPDATE ON characters
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_inventory_timestamp
BEFORE UPDATE ON inventory
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_upgrades_timestamp
BEFORE UPDATE ON upgrades
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_quests_timestamp
BEFORE UPDATE ON quests
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

