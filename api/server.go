package api

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func StartServer() {
	r := mux.NewRouter()
	r.HandleFunc("/scores", GetScores).Methods("GET")
	r.HandleFunc("/scores", PostScore).Methods("POST")

	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./index.html")
	})
	r.PathPrefix("/").Handler(http.FileServer(http.Dir("./")))

	log.Println("Server start on port :8080")
	http.ListenAndServe(":8080", r)
}
