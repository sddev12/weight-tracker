package handlers

import (
	"database/sql"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sddev/weight-tracker/db"
	"github.com/sddev/weight-tracker/models"
)

// GetWeights retrieves all weight entries with optional date filtering
func GetWeights(c *gin.Context) {
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	query := "SELECT id, date, pounds, created_at, updated_at FROM weights"
	args := []interface{}{}

	if startDate != "" && endDate != "" {
		query += " WHERE date >= ? AND date <= ?"
		args = append(args, startDate, endDate)
	} else if startDate != "" {
		query += " WHERE date >= ?"
		args = append(args, startDate)
	} else if endDate != "" {
		query += " WHERE date <= ?"
		args = append(args, endDate)
	}

	query += " ORDER BY date DESC"

	rows, err := db.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error: "Failed to retrieve weights",
		})
		return
	}
	defer rows.Close()

	weights := []models.Weight{}
	for rows.Next() {
		var w models.Weight
		if err := rows.Scan(&w.ID, &w.Date, &w.Pounds, &w.CreatedAt, &w.UpdatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{
				Error: "Failed to scan weight entry",
			})
			return
		}
		weights = append(weights, w)
	}

	c.JSON(http.StatusOK, models.WeightsResponse{Weights: weights})
}

// GetWeight retrieves a single weight entry by ID
func GetWeight(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error: "Invalid weight ID",
		})
		return
	}

	var w models.Weight
	query := "SELECT id, date, pounds, created_at, updated_at FROM weights WHERE id = ?"
	err = db.DB.QueryRow(query, id).Scan(&w.ID, &w.Date, &w.Pounds, &w.CreatedAt, &w.UpdatedAt)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error: "Weight entry not found",
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error: "Failed to retrieve weight entry",
		})
		return
	}

	c.JSON(http.StatusOK, w)
}

// CreateWeight creates a new weight entry
func CreateWeight(c *gin.Context) {
	var input models.WeightInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Invalid request",
			Details: map[string]interface{}{"validation": err.Error()},
		})
		return
	}

	// Validate date format and ensure it's not in the future
	if err := validateDate(input.Date); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Invalid date",
			Details: map[string]interface{}{"date": err.Error()},
		})
		return
	}

	// Insert the weight entry
	query := `INSERT INTO weights (date, pounds, created_at, updated_at) 
	          VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
	result, err := db.DB.Exec(query, input.Date, input.Pounds)

	if err != nil {
		if strings.Contains(err.Error(), "UNIQUE constraint failed") {
			c.JSON(http.StatusConflict, models.ErrorResponse{
				Error: "Weight entry already exists for this date",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error: "Failed to create weight entry",
		})
		return
	}

	id, _ := result.LastInsertId()

	// Retrieve the created entry
	var w models.Weight
	query = "SELECT id, date, pounds, created_at, updated_at FROM weights WHERE id = ?"
	err = db.DB.QueryRow(query, id).Scan(&w.ID, &w.Date, &w.Pounds, &w.CreatedAt, &w.UpdatedAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error: "Failed to retrieve created weight entry",
		})
		return
	}

	c.JSON(http.StatusCreated, w)
}

// UpdateWeight updates an existing weight entry
func UpdateWeight(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error: "Invalid weight ID",
		})
		return
	}

	var input models.WeightInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Invalid request",
			Details: map[string]interface{}{"validation": err.Error()},
		})
		return
	}

	// Validate date format and ensure it's not in the future
	if err := validateDate(input.Date); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Invalid date",
			Details: map[string]interface{}{"date": err.Error()},
		})
		return
	}

	// Check if entry exists
	var exists bool
	err = db.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM weights WHERE id = ?)", id).Scan(&exists)
	if err != nil || !exists {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error: "Weight entry not found",
		})
		return
	}

	// Update the weight entry
	query := `UPDATE weights SET date = ?, pounds = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
	_, err = db.DB.Exec(query, input.Date, input.Pounds, id)

	if err != nil {
		if strings.Contains(err.Error(), "UNIQUE constraint failed") {
			c.JSON(http.StatusConflict, models.ErrorResponse{
				Error: "Weight entry already exists for this date",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error: "Failed to update weight entry",
		})
		return
	}

	// Retrieve the updated entry
	var w models.Weight
	query = "SELECT id, date, pounds, created_at, updated_at FROM weights WHERE id = ?"
	err = db.DB.QueryRow(query, id).Scan(&w.ID, &w.Date, &w.Pounds, &w.CreatedAt, &w.UpdatedAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error: "Failed to retrieve updated weight entry",
		})
		return
	}

	c.JSON(http.StatusOK, w)
}

// DeleteWeight deletes a weight entry
func DeleteWeight(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error: "Invalid weight ID",
		})
		return
	}

	// Check if entry exists
	var exists bool
	err = db.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM weights WHERE id = ?)", id).Scan(&exists)
	if err != nil || !exists {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error: "Weight entry not found",
		})
		return
	}

	// Delete the entry
	_, err = db.DB.Exec("DELETE FROM weights WHERE id = ?", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error: "Failed to delete weight entry",
		})
		return
	}

	c.Status(http.StatusNoContent)
}

// validateDate validates that the date is in YYYY-MM-DD format and not in the future
func validateDate(dateStr string) error {
	// Parse the date
	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return err
	}

	// Check if date is in the future
	now := time.Now().UTC()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)

	if date.After(today) {
		return sql.ErrNoRows // Reuse error, or create custom error
	}

	return nil
}
