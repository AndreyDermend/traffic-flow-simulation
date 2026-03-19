from fastapi.testclient import TestClient

from app import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json()['status'] == 'ok'


def test_run_simulation_endpoint():
    response = client.get('/run-simulation?represented_seconds=300&seed=42')
    assert response.status_code == 200
    data = response.json()
    assert 'metadata' in data
    assert 'snapshots' in data
    assert len(data['snapshots']) == 60
