# 🔎 Architecture Overview

## Diagramme d'ensemble

- Next.js 15 (App Router) avec Server Components
- Supabase (Postgres + Auth + Storage) avec RLS
- Jobs planifiés (ou Edge Functions) pour création/ouverture/fermeture des manches
- Pipeline de notifications (push only pour `round_open`), file `notifications`
- Storage pour avatars/groupes et `submission_media`

## Composants principaux

- Frontend: pages d'onboarding, feed multi‑groupes, vues de manche, publication, commentaires, votes
- Backend applicatif: server actions/API routes pour ops critiques (enrober l'accès DB/RLS)
- Base de données: modèle centré groupe/manches, intégrité via contraintes + triggers
- Sécurité/RLS: visibilité conditionnelle après participation, owners/admins, owner unique

## Flux critiques

- Cycle quotidien: J‑1 création → ouverture (push) → fermeture → consultation
- Participation: soumission (1/user/round) ou vote → déblocage RLS
- Modération: soft delete par owner/admin, jamais de suppression physique

## Décisions clés (extrait)

- Heure française unique (Europe/Paris) pour la planification
- `daily_rounds.group_prompt_id` nullable (fallback si aucun prompt actif)
- `round_open` = push only (pas d'email)

Voir aussi: `docs/data-model.md`, `docs/rls-policies.md`, `docs/workflows.md`, `docs/notifications.md`.

## C4 — Contexte

```mermaid
flowchart LR
  user[Utilisateur] -- Web/App --> app[Next.js App]
  app -- Auth + DB (RLS) --> db[(Supabase Postgres)]
  app -- Storage signed URLs --> storage[(Supabase Storage)]
  jobs[Planificateur\n(Cron/Edge)] -- Crée/Ouvre/Ferme --> db
  db <-- file d'envoi --> notifq[[Table notifications]]
  worker[Notifications Worker] -- Push --> provider[(Push Provider)]
  worker <-- Consomme --> notifq

  classDef ext fill:#eef,stroke:#88a
  class provider ext;
```

## C4 — Conteneurs

```mermaid
flowchart TB
  subgraph Client
    rsc[React RSC/CSR]
    sw[Service Worker Push]
  end

  subgraph Next.js App (Server)
    sa[Server Actions/API Routes]
    edge[Edge Functions (optionnel)]
  end

  subgraph Supabase
    pg[(Postgres + RLS)]
    auth[(Auth)]
    sto[(Storage)]
  end

  subgraph Jobs
    cron[Cron Scheduler]
    notifw[Notifications Worker]
  end

  rsc --> sa
  sa --> pg
  sa --> sto
  sa --> auth
  sw --> notifw
  cron --> pg
  cron --> sa
  pg --> notifw
  notifw --> provider[(Push Provider)]

  classDef svc fill:#f8f8f8,stroke:#bbb
  class provider svc;
```
