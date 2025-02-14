package api

import (
	"encoding/json"
	"log"
	"os"
	"sort"
)

type Score struct {
	Name  string `json:"name"`
	Rank  int    `json:"rank"`
	Score int    `json:"score"`
	Time  int    `json:"time"`
}

var scores []Score

func LoadScores() {
	file, err := os.ReadFile("scores.json")
	if err != nil {
		log.Println("scores.json file not found, creating a new one...")
		scores = []Score{} // Initialize an empty array
		SaveScores()       // Create an empty file
		return
	}
	err = json.Unmarshal(file, &scores)
	if err != nil {
		log.Println("Error reading JSON file:", err)
	}
}

func SaveScores() {
	data, err := json.MarshalIndent(scores, "", "  ") // Readable JSON format
	if err != nil {
		log.Println("Error encoding JSON:", err)
		return
	}

	err = os.WriteFile("./api/scores.json", data, 0644) // Create or overwrite the file
	if err != nil {
		log.Println("Error writing JSON file:", err)
	}
}

func AddScore(newScore Score) {
	scores = append(scores, newScore)
	sort.Slice(scores, func(i, j int) bool {
		return scores[i].Score > scores[j].Score
	})
	SaveScores()
}

func GetTopScores(limit int) []Score {
	if len(scores) < limit {
		return scores
	}
	return scores[:limit]
}
