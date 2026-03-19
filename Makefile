.PHONY: build run backend frontend test sample

build:
	$(MAKE) -C sim-engine build

run:
	./sim-engine/bin/traffic_sim 300 42

backend:
	cd backend && uvicorn app:app --reload

frontend:
	cd frontend && python -m http.server 8080

test: build
	PYTHONPATH=backend pytest backend/tests -q

sample: build
	./sim-engine/bin/traffic_sim 300 42 > data/sample_run.json
