package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/sddev/weight-tracker/models"
)

func TestGetGoal_NoGoalSet(t *testing.T) {
	setupTestDB(t)
	defer teardownTestDB()

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.GET("/goal", GetGoal)

	req, _ := http.NewRequest("GET", "/goal", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var goal models.Goal
	if err := json.Unmarshal(w.Body.Bytes(), &goal); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if goal.Pounds != nil {
		t.Errorf("Expected nil pounds, got %v", *goal.Pounds)
	}
}

func TestUpdateGoal_Success(t *testing.T) {
	setupTestDB(t)
	defer teardownTestDB()

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.PUT("/goal", UpdateGoal)

	pounds := 154.0
	input := models.GoalInput{
		Pounds: &pounds,
	}
	body, _ := json.Marshal(input)

	req, _ := http.NewRequest("PUT", "/goal", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	var goal models.Goal
	if err := json.Unmarshal(w.Body.Bytes(), &goal); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if goal.Pounds == nil {
		t.Fatal("Expected non-nil pounds")
	}

	if *goal.Pounds != 154.0 {
		t.Errorf("Expected pounds 154.0, got %f", *goal.Pounds)
	}
}

func TestUpdateGoal_ClearGoal(t *testing.T) {
	setupTestDB(t)
	defer teardownTestDB()

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.PUT("/goal", UpdateGoal)

	// First set a goal
	pounds := 154.0
	input1 := models.GoalInput{Pounds: &pounds}
	body1, _ := json.Marshal(input1)
	req1, _ := http.NewRequest("PUT", "/goal", bytes.NewBuffer(body1))
	req1.Header.Set("Content-Type", "application/json")
	w1 := httptest.NewRecorder()
	router.ServeHTTP(w1, req1)

	// Then clear it
	input2 := models.GoalInput{Pounds: nil}
	body2, _ := json.Marshal(input2)
	req2, _ := http.NewRequest("PUT", "/goal", bytes.NewBuffer(body2))
	req2.Header.Set("Content-Type", "application/json")
	w2 := httptest.NewRecorder()
	router.ServeHTTP(w2, req2)

	if w2.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w2.Code)
	}

	var goal models.Goal
	if err := json.Unmarshal(w2.Body.Bytes(), &goal); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if goal.Pounds != nil {
		t.Errorf("Expected nil pounds after clearing, got %v", *goal.Pounds)
	}
}

func TestUpdateGoal_InvalidValue(t *testing.T) {
	setupTestDB(t)
	defer teardownTestDB()

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.PUT("/goal", UpdateGoal)

	pounds := -10.0
	input := models.GoalInput{
		Pounds: &pounds,
	}
	body, _ := json.Marshal(input)

	req, _ := http.NewRequest("PUT", "/goal", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400 for negative pounds, got %d", w.Code)
	}
}

func TestGetGoal_AfterSet(t *testing.T) {
	setupTestDB(t)
	defer teardownTestDB()

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.PUT("/goal", UpdateGoal)
	router.GET("/goal", GetGoal)

	// Set goal
	pounds := 160.5
	input := models.GoalInput{Pounds: &pounds}
	body, _ := json.Marshal(input)
	req1, _ := http.NewRequest("PUT", "/goal", bytes.NewBuffer(body))
	req1.Header.Set("Content-Type", "application/json")
	w1 := httptest.NewRecorder()
	router.ServeHTTP(w1, req1)

	// Get goal
	req2, _ := http.NewRequest("GET", "/goal", nil)
	w2 := httptest.NewRecorder()
	router.ServeHTTP(w2, req2)

	if w2.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w2.Code)
	}

	var goal models.Goal
	if err := json.Unmarshal(w2.Body.Bytes(), &goal); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if goal.Pounds == nil {
		t.Fatal("Expected non-nil pounds")
	}

	if *goal.Pounds != 160.5 {
		t.Errorf("Expected pounds 160.5, got %f", *goal.Pounds)
	}

	if goal.UpdatedAt == nil {
		t.Error("Expected non-nil updated_at")
	}
}
