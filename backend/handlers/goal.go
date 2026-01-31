package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/sddev/weight-tracker/db"
	"github.com/sddev/weight-tracker/models"
)

// GetGoal retrieves the goal weight setting
func GetGoal(c *gin.Context) {
	var goal models.Goal
	var value sql.NullString
	var updatedAt sql.NullString

	query := "SELECT value, updated_at FROM settings WHERE key = 'goal_weight'"
	err := db.DB.QueryRow(query).Scan(&value, &updatedAt)

	if err != nil && err != sql.ErrNoRows {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error: "Failed to retrieve goal weight",
		})
		return
	}

	// Parse the value if it's not NULL
	if value.Valid && value.String != "" && value.String != "NULL" {
		if pounds, err := strconv.ParseFloat(value.String, 64); err == nil {
			goal.Pounds = &pounds
		}
	}

	if updatedAt.Valid {
		goal.UpdatedAt = &updatedAt.String
	}

	c.JSON(http.StatusOK, goal)
}

// UpdateGoal updates the goal weight setting
func UpdateGoal(c *gin.Context) {
	var input models.GoalInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Invalid request",
			Details: map[string]interface{}{"validation": err.Error()},
		})
		return
	}

	var value interface{}
	if input.Pounds != nil {
		value = *input.Pounds
	} else {
		value = nil
	}

	query := `UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = 'goal_weight'`
	_, err := db.DB.Exec(query, value)

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error: "Failed to update goal weight",
		})
		return
	}

	// Retrieve the updated goal
	var goal models.Goal
	var valueStr sql.NullString
	var updatedAt sql.NullString

	query = "SELECT value, updated_at FROM settings WHERE key = 'goal_weight'"
	err = db.DB.QueryRow(query).Scan(&valueStr, &updatedAt)

	if err == nil {
		if valueStr.Valid && valueStr.String != "" && valueStr.String != "NULL" {
			if pounds, err := strconv.ParseFloat(valueStr.String, 64); err == nil {
				goal.Pounds = &pounds
			}
		}
		if updatedAt.Valid {
			goal.UpdatedAt = &updatedAt.String
		}
	}

	c.JSON(http.StatusOK, goal)
}
