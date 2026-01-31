package models

// Weight represents a weight entry
type Weight struct {
	ID        int     `json:"id"`
	Date      string  `json:"date"`
	Pounds    float64 `json:"pounds"`
	CreatedAt string  `json:"created_at"`
	UpdatedAt string  `json:"updated_at"`
}

// WeightInput represents the input for creating/updating a weight entry
type WeightInput struct {
	Date   string  `json:"date" binding:"required"`
	Pounds float64 `json:"pounds" binding:"required,gt=0"`
}

// Goal represents the goal weight setting
type Goal struct {
	Pounds    *float64 `json:"pounds"`
	UpdatedAt *string  `json:"updated_at"`
}

// GoalInput represents the input for updating the goal weight
type GoalInput struct {
	Pounds *float64 `json:"pounds" binding:"omitempty,gt=0"`
}

// HealthResponse represents the health check response
type HealthResponse struct {
	Status    string `json:"status"`
	Database  string `json:"database"`
	Timestamp string `json:"timestamp"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error   string                 `json:"error"`
	Details map[string]interface{} `json:"details,omitempty"`
}

// WeightsResponse represents the response for listing weights
type WeightsResponse struct {
	Weights []Weight `json:"weights"`
}
