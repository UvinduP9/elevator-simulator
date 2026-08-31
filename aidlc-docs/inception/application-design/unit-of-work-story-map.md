# Unit to Story Map

Every story is assigned to exactly one unit.

| Story | Unit | Notes |
|---|---|---|
| US-S1 | U1 scaffold-ui | Static 1:1 shell, sample snapshot |
| US-D1 | U2 dispatch-engine | Lowest-cost assign. PBT |
| US-D2 | U2 dispatch-engine | Serve direction / pickup. PBT |
| US-D3 | U2 dispatch-engine | Reverse gate. PBT |
| US-D4 | U2 dispatch-engine | Idle nearby |
| US-D5 | U2 dispatch-engine | Waiting-age. PBT |
| US-D6 | U2 dispatch-engine | Engine has no React; tests |
| US-L2 | U3 simulation-runtime | Hall click + auto destination |
| US-L4 | U3 simulation-runtime | + Add request |
| US-L5 | U3 simulation-runtime | Traffic Off / Normal / Busy |
| US-L6 | U3 simulation-runtime | Pause, reset, speed |
| US-L7 | U3 simulation-runtime | Doors, occupancy count, no refuse |
| US-L1 | U4 live-dashboard | Animated cars / states |
| US-L3 | U4 live-dashboard | Many calls + colored hall assignment |
| US-O1 | U4 live-dashboard | Dispatch evaluation panel |
| US-O2 | U4 live-dashboard | Active requests table |
| US-O3 | U4 live-dashboard | Elevators table |
| US-O4 | U4 live-dashboard | Performance metrics |
| US-O5 | U4 live-dashboard | Event log filter |

**Count**: 19 / 19 stories assigned.

## Per-unit story lists

### U1 scaffold-ui
- [x] US-S1

### U2 dispatch-engine
- [x] US-D1
- [x] US-D2
- [x] US-D3
- [x] US-D4
- [x] US-D5
- [x] US-D6

### U3 simulation-runtime
- [x] US-L2
- [x] US-L4
- [x] US-L5
- [x] US-L6
- [x] US-L7

### U4 live-dashboard
- [x] US-L1
- [x] US-L3
- [x] US-O1
- [x] US-O2
- [x] US-O3
- [x] US-O4
- [x] US-O5
