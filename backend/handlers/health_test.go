package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/sddev/weight-tracker/models"
)

func TestHealthCheck_Success(t *testing.T) {
	setupTestDB(t)
	defer teardownTestDB()

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.GET("/health", HealthCheck)

	req, _ := http.NewRequest("GET", "/health", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response models.HealthResponse
	if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if response.Status != "healthy" {
		t.Errorf("Expected status 'healthy', got '%s'", response.Status)
	}

	if response.Database != "connected" {
		t.Errorf("Expected database 'connected', got '%s'", response.Database)
	}

	if response.Timestamp == "" {
		t.Error("Expected non-empty timestamp")
	}
}

func TestHealthCheck_DatabaseDown(t *testing.T) {
	setupTestDB(t)
	// Close database to simulate failure
	teardownTestDB()

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.GET("/health", HealthCheck)

	req, _ := http.NewRequest("GET", "/health", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("Expected status 500 when database is down, got %d", w.Code)
	}

	var response models.HealthResponse
	if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if response.Status != "unhealthy" {
		t.Errorf("Expected status 'unhealthy', got '%s'", response.Status)
	}

	if response.Database != "disconnected" {
		t.Errorf("Expected database 'disconnected', got '%s'", response.Database)
	}
}
