from __future__ import annotations

import os
import subprocess
from pathlib import Path

from parser import parse_simulation_output


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_BINARY = ROOT / "sim-engine" / "bin" / "traffic_sim"


def get_binary_path() -> Path:
    override = os.getenv("TRAFFIC_SIM_BINARY")
    return Path(override) if override else DEFAULT_BINARY


def run_simulation(represented_seconds: int = 300, seed: int | None = None):
    binary = get_binary_path()
    if not binary.exists():
        raise FileNotFoundError(
            f"Simulation binary not found at {binary}. Run `make build` first."
        )

    command = [str(binary), str(represented_seconds)]
    if seed is not None:
        command.append(str(seed))

    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
        check=True,
    )
    return parse_simulation_output(result.stdout)
