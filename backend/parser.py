from __future__ import annotations

import json
from typing import Any, Dict


REQUIRED_TOP_LEVEL_KEYS = {"metadata", "streets", "snapshots", "summary"}


def parse_simulation_output(raw_output: str) -> Dict[str, Any]:
    """Parse and lightly validate JSON returned by the C engine."""
    payload = json.loads(raw_output)
    missing = REQUIRED_TOP_LEVEL_KEYS.difference(payload.keys())
    if missing:
        raise ValueError(f"Simulation output missing keys: {sorted(missing)}")
    if not isinstance(payload["snapshots"], list) or not payload["snapshots"]:
        raise ValueError("Simulation output contains no snapshots")
    return payload
    
