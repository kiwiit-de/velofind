# ADR-007: MVP Infrastructure Scope and Simplicity

## Status
ACCEPTED

## Context
Premature infrastructure complexity kills early stage projects. Distributed queues (BullMQ/Redis), message buses (Kafka), container orchestrators (Kubernetes), and microservices introduce high hosting bills, debugging nightmares, and deployment fragility before revenue is proven.

## Decision
VeloFind MVP deploys on a single hardened Virtual Private Server (VPS) via Docker Compose.
- Caddy reverse proxy with automatic TLS.
- Unified application container (Next.js / Node.js Express/Fastify).
- PostgreSQL 17 with PostGIS in an isolated internal Docker bridge network.
- Flyway migration container executed as an init step.
- Background feeds executed via Node.js transactional worker protected by PostgreSQL advisory locks (`pg_try_advisory_lock`).

## Alternatives Considered
- Multi-cloud Kubernetes cluster (rejected: prohibitive complexity and cost).
- Serverless microservices (rejected: cold starts, complex VPC peering to PostgreSQL).

## Consequences
- Single VPS cost under €40/month.
- One-click deterministic deployment and zero external cloud vendor lock-in.
- Instant environment spin-up for staging and development.

## Reversal or Expansion Trigger
Horizontal scaling required if peak API request concurrency exceeds 3,000 requests/second.
