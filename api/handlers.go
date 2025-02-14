package api

import (
	"encoding/json"
	"net/http"
)

func GetScores(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(GetTopScores(5))
}

func PostScore(w http.ResponseWriter, r *http.Request) {
	var newScore Score
	json.NewDecoder(r.Body).Decode(&newScore)
	AddScore(newScore)
	w.WriteHeader(http.StatusCreated)
}
