package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sddev/weight-tracker/db"
	"github.com/sddev/weight-tracker/models"
)

// HealthCheck handles the health check endpoint
func HealthCheck(c *gin.Context) {
	dbStatus := "connected"

	// Test database connection
	if err := db.DB.Ping(); err != nil {
		dbStatus = "disconnected"
		c.JSON(http.StatusInternalServerError, models.HealthResponse{
			Status:    "unhealthy",
			Database:  dbStatus,
			Timestamp: time.Now().UTC().Format(time.RFC3339),
		})
		return
	}

	c.JSON(http.StatusOK, models.HealthResponse{
		Status:    "healthy",
		Database:  dbStatus,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	})
}
