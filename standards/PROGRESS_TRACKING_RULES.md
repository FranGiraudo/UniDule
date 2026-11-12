# Project Manager - AI Tracking Rules

This repository is tracked by the **Progress Deck (ProjectManager)** application.
When interacting with this repository, you must maintain the progress tracking files located in the `.progress/` directory.

## Rules for AI Assistants

1. **Always Update Tasks:** When you complete a task or a user requests a new feature, update `.progress/tasks.json`.
2. **Update Roadmap:** When a major milestone is reached, update the status of the nodes in `.progress/roadmap.json`.
3. **Format strictly as JSON:** The Progress Deck application relies on these JSON files being perfectly formatted. Do not add markdown comments inside the JSON.

## Structure of `.progress/tasks.json`
It must be an array of objects:
```json
[
  {
    "id": "T-01",
    "title": "Setup basic structure",
    "status": "completed", // "queued", "in_progress", "completed"
    "nodeId": "N-01" // Links to a roadmap node
  }
]
```

## Structure of `.progress/roadmap.json`
It must be an array of node objects representing major milestones:
```json
[
  {
    "id": "N-01",
    "title": "Core Architecture",
    "status": "done" // "locked", "active", "done"
  }
]
```
