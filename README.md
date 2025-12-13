# Proctor

Proctor is a node-based visual editor for **emitting database schema definitions from UI interactions**. It is designed to speed up **forward-engineering of relational data models** by allowing developers to create tables, fields, and relationships visually, then generate schema output directly from those interactions.

Proctor is built with **Remix.js** and is **directly portable to React**, making it suitable both as a standalone tool and as an embeddable component in existing applications.

---

## Core Idea

Traditional schema design tools separate **modeling** from **implementation**. Proctor collapses that gap.

Instead of:
- Designing ER diagrams in one tool
- Translating them manually into SQL / ORM schemas
- Keeping diagrams and schemas in sync

Proctor:
- Treats UI interactions as the **source of truth**
- Emits schema definitions directly from the graph state
- Keeps visual representation and generated output tightly coupled

This reduces drift, duplication, and translation errors.

---

## Features

- **Node-based editor**
  - Tables, models, or entities represented as nodes
  - Fields and constraints defined per node
- **Visual relationship modeling**
  - One-to-one, one-to-many, many-to-many
  - Foreign keys inferred from connections
- **Schema emission**
  - Generate database schema definitions from the graph
  - Designed for forward-engineering workflows
- **Remix-first architecture**
  - Runs as a Remix app
  - UI and logic portable to React without framework lock-in
- **Deterministic output**
  - Same graph state always produces the same schema

---

## What Proctor Is (and Isn’t)

**Proctor is:**
- A forward-engineering tool
- A schema generator driven by UI state
- A productivity tool for early and iterative data modeling

**Proctor is not:**
- A database migration engine
- A live database intros
