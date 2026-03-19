# Assumptions and limitations

1. **Observed counts are approximate**
   This model is intended as a software / simulation project, not a formal transportation study.

2. **Routing is probabilistic**
   Cars choose destinations based on configured percentages rather than lane-by-lane traffic logic.

3. **Signal timing is simplified**
   The model does not include yellow lights, protected turn phases, pedestrian crossings, or adaptive traffic control.

4. **No physical collision model**
   This is a queueing and flow simulation, not a physics engine.

5. **No historical persistence**
   Output is returned as JSON per run; there is no database layer in this version.
