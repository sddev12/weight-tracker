-- Weight Tracker Database Schema
-- SQLite Database

-- Table: weights
-- Stores individual weight measurements
CREATE TABLE IF NOT EXISTS weights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    pounds REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index on date for optimized queries
CREATE INDEX IF NOT EXISTS idx_weights_date ON weights(date DESC);

-- Table: settings
-- Stores application settings including goal weight
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Initialize goal_weight setting
INSERT OR IGNORE INTO settings (key, value) VALUES ('goal_weight', NULL);
