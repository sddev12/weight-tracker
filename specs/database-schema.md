# Weight Tracker - Database Schema

## Database: SQLite

**File Location:** `/data/weight-tracker.db`

## Tables

### weights

Stores individual weight measurements.

```sql
CREATE TABLE IF NOT EXISTS weights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    pounds REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### Columns

| Column     | Type    | Constraints                         | Description                                        |
| ---------- | ------- | ----------------------------------- | -------------------------------------------------- |
| id         | INTEGER | PRIMARY KEY, AUTOINCREMENT          | Unique identifier for weight entry                 |
| date       | TEXT    | NOT NULL, UNIQUE                    | Date of weight measurement (YYYY-MM-DD format)     |
| pounds     | REAL    | NOT NULL                            | Weight in pounds (total pounds, not stones/pounds) |
| created_at | TEXT    | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Timestamp when record was created (ISO 8601)       |
| updated_at | TEXT    | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Timestamp when record was last updated (ISO 8601)  |

#### Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_weights_date ON weights(date DESC);
```

**Purpose:** Optimize date-based queries and sorting (most recent first)

#### Constraints

- **UNIQUE on date:** Only one weight entry per date allowed
- **NOT NULL on pounds:** Weight value is required
- **CHECK constraint (application level):** pounds > 0

#### Example Data

```sql
INSERT INTO weights (date, pounds) VALUES ('2026-01-27', 168.5);
INSERT INTO weights (date, pounds) VALUES ('2026-01-26', 169.2);
INSERT INTO weights (date, pounds) VALUES ('2026-01-25', 170.0);
```

### settings

Stores application settings including goal weight.

```sql
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### Columns

| Column     | Type | Constraints                         | Description                                      |
| ---------- | ---- | ----------------------------------- | ------------------------------------------------ |
| key        | TEXT | PRIMARY KEY                         | Setting identifier (e.g., 'goal_weight')         |
| value      | TEXT | NULL allowed                        | Setting value (stored as text, parsed as needed) |
| updated_at | TEXT | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Timestamp when setting was last updated          |

#### Predefined Keys

| Key         | Value Type     | Description                                 |
| ----------- | -------------- | ------------------------------------------- |
| goal_weight | REAL (as TEXT) | Target weight in pounds, or NULL if not set |

#### Example Data

```sql
INSERT INTO settings (key, value) VALUES ('goal_weight', '154.0');
```

## Database Initialization

The Go backend application will execute the following on startup:

```sql
-- Create weights table
CREATE TABLE IF NOT EXISTS weights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    pounds REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on weights.date
CREATE INDEX IF NOT EXISTS idx_weights_date ON weights(date DESC);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Initialize goal_weight setting if not exists
INSERT OR IGNORE INTO settings (key, value) VALUES ('goal_weight', NULL);
```

## Data Types

### Date Storage

- Stored as TEXT in ISO 8601 format: `YYYY-MM-DD`
- Example: `2026-01-27`
- SQLite TEXT comparison works correctly for sorting dates in this format

### Timestamp Storage

- Stored as TEXT in ISO 8601 format with timezone: `YYYY-MM-DDTHH:MM:SSZ`
- Example: `2026-01-27T10:30:00Z`
- Always stored in UTC

### Numeric Storage

- Pounds stored as REAL (floating-point)
- Allows decimal precision (e.g., 168.5 pounds)

## Queries

### Common Query Patterns

#### Get weights within date range

```sql
SELECT * FROM weights
WHERE date >= ? AND date <= ?
ORDER BY date DESC;
```

#### Get weights for last N days

```sql
SELECT * FROM weights
WHERE date >= date('now', '-7 days')
ORDER BY date DESC;
```

#### Get latest weight

```sql
SELECT * FROM weights
ORDER BY date DESC
LIMIT 1;
```

#### Get goal weight

```sql
SELECT value FROM settings
WHERE key = 'goal_weight';
```

#### Update goal weight

```sql
UPDATE settings
SET value = ?, updated_at = CURRENT_TIMESTAMP
WHERE key = 'goal_weight';
```

#### Insert weight entry

```sql
INSERT INTO weights (date, pounds, created_at, updated_at)
VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

#### Update weight entry

```sql
UPDATE weights
SET date = ?, pounds = ?, updated_at = CURRENT_TIMESTAMP
WHERE id = ?;
```

## Backup and Restore

### Backup

```bash
# Copy database file
cp /data/weight-tracker.db /backup/weight-tracker-$(date +%Y%m%d).db

# Or use SQLite backup command
sqlite3 /data/weight-tracker.db ".backup /backup/weight-tracker-$(date +%Y%m%d).db"
```

### Restore

```bash
# Copy backup file
cp /backup/weight-tracker-20260127.db /data/weight-tracker.db

# Or use SQLite restore command
sqlite3 /data/weight-tracker.db ".restore /backup/weight-tracker-20260127.db"
```

## Migration Strategy

For this simple application:

- Schema changes handled manually during development
- Production: Export data, update schema, re-import data
- Future: Consider migration tool like golang-migrate for version control

## Performance Considerations

- Single user, low volume: No performance concerns expected
- Index on date column optimizes date range queries
- SQLite handles thousands of records efficiently
- File-based database is fast for read-heavy workloads

## Data Retention

No automatic deletion policy. User can manually delete entries via API/UI.

## Constraints and Validation

### Application-Level Constraints

- Date cannot be in the future
- Pounds must be positive (> 0)
- Only one entry per date (enforced by UNIQUE constraint)

### Database-Level Constraints

- UNIQUE constraint on date
- NOT NULL constraints on required fields
- PRIMARY KEY constraints for uniqueness
