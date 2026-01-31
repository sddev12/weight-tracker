package db

import (
	"os"
	"testing"
)

func TestInitDB_Success(t *testing.T) {
	// Use in-memory database for testing
	os.Setenv("DATABASE_PATH", ":memory:")
	defer os.Unsetenv("DATABASE_PATH")

	err := InitDB()
	if err != nil {
		t.Fatalf("Expected InitDB to succeed, got error: %v", err)
	}
	defer CloseDB()

	// Verify database connection
	if err := DB.Ping(); err != nil {
		t.Errorf("Database ping failed: %v", err)
	}

	// Verify tables exist
	tables := []string{"weights", "settings"}
	for _, table := range tables {
		var name string
		query := "SELECT name FROM sqlite_master WHERE type='table' AND name=?"
		err := DB.QueryRow(query, table).Scan(&name)
		if err != nil {
			t.Errorf("Table %s should exist, got error: %v", table, err)
		}
	}
}

func TestInitDB_InvalidPath(t *testing.T) {
	// Set invalid path (directory that doesn't exist and can't be created)
	os.Setenv("DATABASE_PATH", "/invalid/path/that/does/not/exist/database.db")
	defer os.Unsetenv("DATABASE_PATH")

	err := InitDB()
	if err == nil {
		t.Error("Expected InitDB to fail with invalid path")
		CloseDB()
	}
}

func TestCloseDB(t *testing.T) {
	os.Setenv("DATABASE_PATH", ":memory:")
	defer os.Unsetenv("DATABASE_PATH")

	if err := InitDB(); err != nil {
		t.Fatalf("Failed to initialize database: %v", err)
	}

	if err := CloseDB(); err != nil {
		t.Errorf("CloseDB failed: %v", err)
	}

	// Verify database is closed by attempting to ping
	if DB != nil {
		if err := DB.Ping(); err == nil {
			t.Error("Database should be closed")
		}
	}
}

func TestCloseDB_NilDatabase(t *testing.T) {
	// Ensure DB is nil
	DB = nil

	// CloseDB should handle nil gracefully
	if err := CloseDB(); err != nil {
		t.Errorf("CloseDB should handle nil DB gracefully, got error: %v", err)
	}
}

func TestCreateTables_Idempotent(t *testing.T) {
	os.Setenv("DATABASE_PATH", ":memory:")
	defer os.Unsetenv("DATABASE_PATH")

	// Initialize once
	if err := InitDB(); err != nil {
		t.Fatalf("First InitDB failed: %v", err)
	}

	// Initialize again - should not error (CREATE TABLE IF NOT EXISTS)
	if err := createTables(); err != nil {
		t.Errorf("createTables should be idempotent, got error: %v", err)
	}

	CloseDB()
}

func TestInitDB_GoalWeightSetting(t *testing.T) {
	os.Setenv("DATABASE_PATH", ":memory:")
	defer os.Unsetenv("DATABASE_PATH")

	if err := InitDB(); err != nil {
		t.Fatalf("InitDB failed: %v", err)
	}
	defer CloseDB()

	// Verify goal_weight setting exists (value can be NULL)
	var count int
	query := "SELECT COUNT(*) FROM settings WHERE key = 'goal_weight'"
	err := DB.QueryRow(query).Scan(&count)

	if err != nil {
		t.Fatalf("Failed to query settings: %v", err)
	}

	if count != 1 {
		t.Errorf("Expected 1 goal_weight setting, got %d", count)
	}
}
