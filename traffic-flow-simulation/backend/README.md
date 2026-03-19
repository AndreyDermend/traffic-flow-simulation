# Backend

FastAPI wrapper around the compiled C simulation engine.

## Install

```bash
pip install -r requirements.txt
```

## Run

```bash
uvicorn app:app --reload
```

## Endpoints

- `GET /health`
- `GET /run-simulation?represented_seconds=300&seed=42`
