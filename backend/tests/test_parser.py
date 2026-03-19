from parser import parse_simulation_output


def test_parse_simulation_output_accepts_valid_payload():
    payload = '{"metadata":{},"streets":[],"snapshots":[{"tick":1}],"summary":{}}'
    parsed = parse_simulation_output(payload)
    assert "snapshots" in parsed
    assert parsed["snapshots"][0]["tick"] == 1
