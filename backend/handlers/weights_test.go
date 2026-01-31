package handlers

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/mattn/go-sqlite3"
	"github.com/sddev/weight-tracker/db"
	"github.com/sddev/weight-tracker/models"
)

func setupTestDB(t *testing.T) {
	var err error
	db.DB, err = sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("Failed to open test database: %v", err)
	}

	schema := `
	CREATE TABLE IF NOT EXISTS weights (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		date TEXT NOT NULL UNIQUE,
		pounds REAL NOT NULL,
		created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
	);

	CREATE INDEX IF NOT EXISTS idx_weights_date ON weights(date DESC);

	CREATE TABLE IF NOT EXISTS settings (
		key TEXT PRIMARY KEY,
		value TEXT,
		updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
	);

	INSERT OR IGNORE INTO settings (key, value) VALUES ('goal_weight', NULL);
	`

	if _, err := db.DB.Exec(schema); err != nil {
		t.Fatalf("Failed to create schema: %v", err)
	}
}

func teardownTestDB() {
	if db.DB != nil {
		db.DB.Close()
	}
}

func TestGetWeights_Empty(t *testing.T) {
	setupTestDB(t)
	defer teardownTestDB()

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.GET("/weights", GetWeights)

	req, _ := http.NewRequest("GET", "/weights", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response models.WeightsResponse
	if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if len(response.Weights) != 0 {
		t.Errorf("Expected 0 weights, got %d", len(response.Weights))
	}
}

func TestCreateWeight_Success(t *testing.T) {
	setupTestDB(t)
	defer teardownTestDB()

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.POST("/weights", CreateWeight)

	today := time.Now().Format("2006-01-02")
	input := models.WeightInput{
		Date:   today,
		Pounds: 170.5,
	}
	body, _ := json.Marshal(input)

	req, _ := http.NewRequest("POST", "/weights", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Errorf("Expected status 201, got %d. Body: %s", w.Code, w.Body.String())
	}

	var weight models.Weight
	if err := json.Unmarshal(w.Body.Bytes(), &weight); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if weight.Date != today {
		t.Errorf("Expected date %s, got %s", today, weight.Date)
	}
	if weight.Pounds != 170.5 {
		t.Errorf("Expected pounds 170.5, got %f", weight.Pounds)
	}
	if weight.ID == 0 {
		t.Error("Expected non-zero ID")
	}
}

func TestCreateWeight_InvalidDate(t *testing.T) {
	setupTestDB(t)
	defer teardownTestDB()

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.POST("/weights", CreateWeight)

	input := models.WeightInput{
		Date:   "invalid-date",
		Pounds: 170.5,
	}
	body, _ := json.Marshal(input)

	req, _ := http.NewRequest("POST", "/weights", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", w.Code)
	}
}

func TestCreateWeight_FutureDate(t *testing.T) {
	setupTestDB(t)
	defer teardownTestDB()

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.POST("/weights", CreateWeight)

	futureDate := time.Now().AddDate(0, 0, 1).Format("2006-01-02")
	input := models.WeightInput{
		Date:   futureDate,
		Pounds: 170.5,
	}
	body, _ := json.Marshal(input)

	req, _ := http.NewRequest("POST", "/weights", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400 for future date, got %d", w.Code)
	}
}

func TestCreateWeight_InvalidPounds(t *testing.T) {
	setupTestDB(t)
	defer teardownTestDB()

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.POST("/weights", CreateWeight)

	today := time.Now().Format("2006-01-02")
	input := map[string]interface{}{
		"date":   today,
		"pounds": -10.5,
	}
	body, _ := json.Marshal(input)

	req, _ := http.NewRequest("POST", "/weights", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400 for negative pounds, got %d", w.Code)
	}
}

func TestCreateWeight_DuplicateDate(t *testing.T) {
	setupTestDB(t)
	defer teardownTestDB()

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.POST("/weights", CreateWeight)

	today := time.Now().Format("2006-01-02")
	input := models.WeightInput{
		Date:   today,
		Pounds: 170.5,
	}
	body, _ := json.Marshal(input)

	// First request
	req1, _ := http.NewRequest("POST", "/weights", bytes.NewBuffer(body))
	req1.Header.Set("Content-Type", "application/json")
	w1 := httptest.NewRecorder()
	router.ServeHTTP(w1, req1)

	if w1.Code != http.StatusCreated {
		t.Fatalf("First request should succeed, got status %d", w1.Code)
	}

	// Second request with same date
	req2, _ := http.NewRequest("POST", "/weights", bytes.NewBuffer(body))
	req2.Header.Set("Content-Type", "application/json")
	w2 := httptest.NewRecorder()
	router.ServeHTTP(w2, req2)

	if w2.Code != http.StatusConflict {
		t.Errorf("Expected status 409 for duplicate date, got %d", w2.Code)
	}
}

func TestGetWeight_Success(t *testing.T) {
	setupTestDB(t)
	defer teardownTestDB()

	// Insert test data
	today := time.Now().Format("2006-01-02")
	result, _ := db.DB.Exec("INSERT INTO weights (date, pounds) VALUES (?, ?)", today, 170.5)
	id, _ := result.LastInsertId()

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.GET("/weights/:id", GetWeight)

	req, _ := http.NewRequest("GET", "/weights/1", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var weight models.Weight
	if err := json.Unmarshal(w.Body.Bytes(), &weight); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if weight.ID != int(id) {
		t.Errorf("Expected ID %d, got %d", id, weight.ID)
	}
	if weight.Pounds != 170.5 {
		t.Errorf("Expected pounds 170.5, got %f", weight.Pounds)
	}
}

func TestGetWeight_NotFound(t *testing.T) {
	setupTestDB(t)
	defer teardownTestDB()

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.GET("/weights/:id", GetWeight)

	req, _ := http.NewRequest("GET", "/weights/999", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("Expected status 404, got %d", w.Code)
	}
}

func TestUpdateWeight_Success(t *testing.T) {
	setupTestDB(t)
	defer teardownTestDB()

	// Insert test data
	today := time.Now().Format("2006-01-02")
	db.DB.Exec("INSERT INTO weights (date, pounds) VALUES (?, ?)", today, 170.5)

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.PUT("/weights/:id", UpdateWeight)

	input := models.WeightInput{
		Date:   today,
		Pounds: 168.0,
	}
	body, _ := json.Marshal(input)

	req, _ := http.NewRequest("PUT", "/weights/1", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	var weight models.Weight
	if err := json.Unmarshal(w.Body.Bytes(), &weight); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if weight.Pounds != 168.0 {
		t.Errorf("Expected updated pounds 168.0, got %f", weight.Pounds)
	}
}

func TestUpdateWeight_NotFound(t *testing.T) {
	setupTestDB(t)
	defer teardownTestDB()

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.PUT("/weights/:id", UpdateWeight)

	today := time.Now().Format("2006-01-02")
	input := models.WeightInput{
		Date:   today,
		Pounds: 168.0,
	}
	body, _ := json.Marshal(input)

	req, _ := http.NewRequest("PUT", "/weights/999", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("Expected status 404, got %d", w.Code)
	}
}

func TestDeleteWeight_Success(t *testing.T) {
	setupTestDB(t)
	defer teardownTestDB()

	// Insert test data
	today := time.Now().Format("2006-01-02")
	db.DB.Exec("INSERT INTO weights (date, pounds) VALUES (?, ?)", today, 170.5)

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.DELETE("/weights/:id", DeleteWeight)

	req, _ := http.NewRequest("DELETE", "/weights/1", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusNoContent {
		t.Errorf("Expected status 204, got %d", w.Code)
	}

	// Verify deletion
	var count int
	db.DB.QueryRow("SELECT COUNT(*) FROM weights WHERE id = 1").Scan(&count)
	if count != 0 {
		t.Error("Weight entry should be deleted")
	}
}

func TestDeleteWeight_NotFound(t *testing.T) {
	setupTestDB(t)
	defer teardownTestDB()

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.DELETE("/weights/:id", DeleteWeight)

	req, _ := http.NewRequest("DELETE", "/weights/999", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("Expected status 404, got %d", w.Code)
	}
}

func TestGetWeights_WithDateRange(t *testing.T) {
	setupTestDB(t)
	defer teardownTestDB()

	// Insert test data
	db.DB.Exec("INSERT INTO weights (date, pounds) VALUES ('2026-01-01', 170.0)")
	db.DB.Exec("INSERT INTO weights (date, pounds) VALUES ('2026-01-15', 168.0)")
	db.DB.Exec("INSERT INTO weights (date, pounds) VALUES ('2026-01-31', 166.0)")

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.GET("/weights", GetWeights)

	req, _ := http.NewRequest("GET", "/weights?start_date=2026-01-10&end_date=2026-01-20", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response models.WeightsResponse
	if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if len(response.Weights) != 1 {
		t.Errorf("Expected 1 weight in range, got %d", len(response.Weights))
	}

	if len(response.Weights) > 0 && response.Weights[0].Date != "2026-01-15" {
		t.Errorf("Expected date 2026-01-15, got %s", response.Weights[0].Date)
	}
}
