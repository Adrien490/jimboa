#! 🌐 Environments & Config

## Variables d'environnement (extrait v1)

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `APP_CREATOR_EMAIL` (gating interface admin globale)
- `PUSH_WEB_VAPID_PUBLIC_KEY` / `PUSH_WEB_VAPID_PRIVATE_KEY` (si web push)
- `NOTIFICATIONS_ENABLED` (feature flag global optionnel)

## Secrets & sécurité

- Ne pas exposer de secrets côté client
- Rotation régulière des clés et permissions minimales

## Environnements

- Local: clés de dev, outils de test (ex: Inbucket pour emails)
- Préprod: proximités prod, jeux de données masqués
- Prod: secrets chiffrés et accès restreint

## Paramètres DB (optionnel)

- GUC pour `app.app_creator_email` si nécessaire (voir E1)
- Paramètres fuso‑horaire: Europe/Paris (calcul open/close en UTC)

Voir aussi: `docs/tech-stack.md`, `docs/architecture.md`.

