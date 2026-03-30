.PHONY: build run-engine backend-setup backend frontend dev test-local clean

build:
	$(MAKE) -C sim-engine build

run-engine:
	./sim-engine/bin/traffic_sim 300 42

backend-setup:
	cd backend && python3 -m venv .venv && . .venv/bin/activate && python -m pip install --upgrade pip && python -m pip install -r requirements.txt

backend:
	cd backend && . .venv/bin/activate && python -m uvicorn app:app --reload

frontend:
	cd frontend && python3 -m http.server 8080

dev:
	chmod +x scripts/dev.sh
	./scripts/dev.sh

test-local:
	chmod +x scripts/test_local.sh
	./scripts/test_local.sh

clean:
	rm -rf backend/.venv
	rm -f data/sample_run.json
	rm -rf sim-engine/bin
