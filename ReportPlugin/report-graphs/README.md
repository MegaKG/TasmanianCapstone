# Report Graph Generation

This folder contains a Chart.js prototype for generating graphs used in the Individual Participant Report.

**Important: All graphs are illustrative and generated using mock data from `sampleData.js`. They do not represent real participant results. Actual ELF scoring calculations and backend data integration are not yet implemented.**

## Files

- `sampleGraph.js` — Generates individual graphs using Chart.js.
- `sampleData.js` — Contains mock participant scores.
- `output/` — Stores generated PNG graphs.

## Setup

From the repository root, install dependencies:

```bash
npm install
```

## Generate Individual Graphs

Run the following commands from the repository root.

**Insight — Initial (Page 3)**
```bash
node ReportPlugin/report-graphs/sampleGraph.js insight initial
```

**Insight — Delayed (Page 3)**
```bash
node ReportPlugin/report-graphs/sampleGraph.js insight delayed
```

**Self-Awareness (Page 4)**
```bash
node ReportPlugin/report-graphs/sampleGraph.js self-awareness
```

**Influence Comparison (Page 5)**
```bash
node ReportPlugin/report-graphs/sampleGraph.js influence
```

**Impact Distribution (Page 7)**
```bash
node ReportPlugin/report-graphs/sampleGraph.js impact
```

**Scoring Context (Page 10)**
```
node ReportPlugin/report-graphs/sampleGraph.js scoring-context
```

Each command generates only the selected graph as a PNG in `ReportPlugin/report-graphs/output/`.

## Current Status

Initial Chart.js graph generation is implemented with numeric labels and sample scores.

All mock capability scores are on a 0–100 scale. The Impact doughnut displays relative percentage shares rather than individual capability scores.

**This is a visualisation prototype only.** Future work includes connecting real participant data, implementing or receiving confirmed ELF scoring calculations, and integrating the generated graphs into PDF reports.