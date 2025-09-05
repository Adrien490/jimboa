# 🗓️ Roadmap & Jalons

## 🎯 Vision MVP (Phase 1)

Objectif: livrer une PWA simple qui permet à des groupes privés de jouer à un prompt quotidien avec soumissions, commentaires, (votes si applicable), et notifications d’ouverture.

Portée fonctionnelle MVP:
- Auth Google + profils auto (nom, avatar)
- Groupes: création, join via code UPPER, image optionnelle, owner unique, admins
- Réglages groupe: `drop_time` (heure France), `notifications_enabled`, `allow_global_prompts`
- Prompts: locaux (CRUD owner/admin, `is_enabled`), suggestions locales (pending → approved/rejected), catalogue global en lecture (approved)
- Sélection quotidienne: prompts locaux approuvés/activés (+ globaux si autorisé), anti‑répétition N=7, blocklist, audience (optionnel v1.1), min/max group size
- Manches quotidiennes: création J‑1, ouverture J (snapshot inline), fermeture J+1 (1 jour local exact)
- Interactions: 1 soumission/user/round, commentaires, votes (définitifs) pour type vote
- Visibilité conditionnelle: RLS basée sur participation (soumission OU vote)
- Notifications: `round_open` push avec préférences par groupe (mute/push)
- Archives: consultation lecture seule post‑fermeture

Hors‑scope MVP:
- Emails, scoring/leaderboards, modération avancée (reports), multi‑fuseaux, analytics produit avancés

---

## 🧱 Découpage par jalons

### J0 — Setup & Fondations (sem. 1)
- Repo + CI minimale
- Environnements + `.env` (Supabase, push)
- Migrations DB v1: tables, FK, index
- Triggers d’intégrité essentiels (join_code UPPER, owner unique, votes définitifs, contrôle temporel commentaires/soumissions)
- Fonctions RLS (`user_has_participated`)
- Politiques RLS table‑par‑table (sélection, WITH CHECK)

Critères de succès:
- Migrations s’appliquent à blanc sans erreur
- RLS activées sans fuite de données (smoke tests)

### J1 — Noyau Produit (sem. 2)
- Auth Google + création `profiles`
- Groupes: create/join, settings (drop_time, notifications_enabled, allow_global_prompts)
- Prompts locaux: CRUD + `is_enabled`, suggestions locales (pending → approved/rejected)
- Catalogue global (lecture approved) + interface admin app creator (gated)

Critères de succès:
- Créer un groupe, y rejoindre via code, gérer prompts locaux
- Gating admin global fonctionnel (email)

### J2 — Cycle Quotidien (sem. 3)
- Jobs cron: create‑rounds (J‑1), open‑rounds (snapshot + notifs), close‑rounds
- Sélection: anti‑répétition N=7, blocklist, min/max group size, audience (optionnel v1.1)
- Règle d’ouverture sans snapshot: rester en scheduled, retry périodique

Critères de succès:
- Rounds créés/ouverts/fermés automatiquement sur un jeu de données de test
- Anti‑répétition & blocklist vérifiables en base

### J3 — Interactions & Notifs (sem. 4)
- Soumissions (1/user/round), commentaires, votes (définitifs)
- Visibilité conditionnelle (RLS) sur interactions
- Notifications `round_open` (preferences mute/push + ciblage)

Critères de succès:
- Gating RLS correct (avant/après participation)
- Envoi push et ciblage conformes aux prefs

### J4 — Beta Fermée (sem. 5)
- UX “Aujourd’hui” + Archives, feed multi‑groupes
- Pages publiques privacy/terms (contenu minimal)
- Observabilité: logs, traces jobs, métriques clés
- Hardening: limites médias, résilience uploads

Critères de succès:
- 5–10 groupes test utilisent l’app 7 jours
- >95% des rounds créés à l’heure prévue, p50 push < 30s

---

## 📏 KPIs & Critères de succès (MVP)
- Fiabilité du cycle: >95% de manches créées/ouvertes/fermées dans la fenêtre
- Latence notif `round_open`: p50 < 30s, p95 < 2min
- Taux de participation quotidien (sur groupes actifs) > 50%
- Zéro fuite RLS (vérifiée par tests ciblés)
- Zéro incident bloquant en beta (SLA interne)

---

## 📦 Livrables
- Scripts migrations (SQL) + README d’exécution
- Pages publiques privacy/terms
- Jobs cron (routes/api) + worker notifications
- Matrice RLS documentée (`docs/rls-policies.md`)

---

## 📚 Références
- Modèle de données: `docs/data-model.md`
- RLS & Security: `docs/rls-policies.md`
- Workflows: `docs/workflows.md`
- Observabilité: `docs/risks-monitoring.md`
