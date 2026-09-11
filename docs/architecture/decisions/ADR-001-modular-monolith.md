# ADR-001: Modular Monolith Architecture

## Status
ACCEPTED

## Context
VeloFind requires a unified development and deployment workflow for the MVP. Splitting into multiple microservices at this stage would introduce distributed transactions, deployment complexity, latency, and premature operational overhead.

## Decision
Adopt a TypeScript modular monolith combining a Next.js/React frontend with a structured backend service (Fastify/Express) running on Node 22. Boundaries are strictly organized by domain: `catalog`, `dealers`, `offers`, `imports`, `search`, `leads`, `attribution`, and `auth`.

## Alternatives Considered
- Distributed microservices (rejected: high operational burden for MVP).
- Static site with serverless functions (rejected: complex stateful import locking and PostGIS queries).

## Consequences
- Fast local development and single container deployment.
- High cohesion and straightforward transaction boundaries.
- Low operational cost on a single VPS.

## Reversal or Expansion Trigger
Extraction of dedicated ingestion worker service if daily feed volume exceeds 500,000 items or causes CPU contention on the API process.
