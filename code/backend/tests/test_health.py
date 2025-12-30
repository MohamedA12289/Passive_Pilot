from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()

    # Accept either legacy or current health format
    if "status" in data:
        assert data["status"] == "ok"
    else:
        assert data.get("ok") is True
