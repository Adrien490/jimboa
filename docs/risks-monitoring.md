# ⚠️ Risques & Garde-fous

## 🔒 Risques techniques

| Risque                 | Impact                | Mitigation                                                     |
| ---------------------- | --------------------- | -------------------------------------------------------------- |
| **Concurrence jobs**   | 🔴 Corruption données | Advisory locks + transitions strictes                          |
| **Spam notifications** | 🟡 UX dégradée        | Préférences + `notifications_enabled` + ciblage `user_devices` |
| **Surcharge uploads**  | 🟡 Performance        | Limites taille + compression + CDN                             |
| **Race conditions**    | 🔴 États incohérents  | Transactions + contraintes DB + horodatage explicite           |

## 🛡️ Risques produit

| Risque                   | Impact                   | Mitigation                                |
| ------------------------ | ------------------------ | ----------------------------------------- |
| **Contenus sensibles**   | 🟡 Modération nécessaire | Suppression owner/admin (v1)              |
| **Fatigue prompts**      | 🟡 Engagement baisse     | Sélection diversifiée + banque croissante |
| **Groupes inactifs**     | 🟢 Ressources gaspillées | Détection + archivage auto                |
| **Abandon utilisateurs** | 🟡 Rétention faible      | Onboarding optimisé + notifications       |

## 📊 Monitoring & Alertes

### Métriques core

- **Participation quotidienne** : Taux de soumission par groupe
- **Temps d'exécution des jobs** : Performance des workflows automatisés
- **Taux d'erreur** : Échecs par type d'opération
- **Latence API** : Temps de réponse des endpoints critiques

### Alertes

- **Échecs jobs** : > 5% d'échecs sur 1h
- **Pics d'erreurs** : > 10 erreurs/min sur 5min
- **Goulets d'étranglement** : Latence > 2s sur endpoints critiques
- **Stockage** : > 80% d'utilisation disque

### Dashboards

- **Santé système** : Jobs, erreurs, performance
- **Usage utilisateurs** : MAU, rétention, engagement
- **Performance** : Latence, throughput, disponibilité

## 🔐 Sécurité

### Mesures préventives

- **Row Level Security (RLS)** : Contrôle d'accès au niveau base de données
- **Triggers de validation** : Intégrité métier automatisée
- **Appartenance stricte** : Vérification membership pour toute action
- **Tokens uniques** : Gestion sécurisée des appareils

### Audit et logs

- **Actions sensibles** : Création/suppression groupes, modération
- **Échecs d'authentification** : Tentatives d'accès non autorisées
- **Modifications admin** : Soft delete, changements de rôles

## 🚨 Plan de continuité

### Backup et récupération

- **Sauvegardes automatiques** : Base de données + storage
- **Tests de restauration** : Validation mensuelle
- **RTO/RPO** : < 4h de récupération, < 1h de perte max

### Escalade des incidents

1. **Détection automatique** : Alertes monitoring
2. **Triage** : Classification par impact
3. **Communication** : Status page + notifications
4. **Résolution** : Procédures documentées

---

## 🔭 Observabilité — Mise en œuvre

### Logs applicatifs (structurés)
- Format JSON avec `ts`, `level`, `msg`, `context` (user_id, group_id, round_id, request_id)
- Niveaux: debug/info/warn/error; corrélation `request_id`/`job_id`
- Redaction des données sensibles; pas de PII inutile

### Traces jobs (cycle quotidien)
- create‑rounds: groupes parcourus, rounds créés (count), échecs (liste), durée
- open‑rounds: rounds éligibles, snapshots résolus vs impossibles (et raison), notifications créées (count), durée
- close‑rounds: rounds fermés (count), durée
- Advisory locks: taux de contention

### Métriques envoyées
- Compteurs: `rounds_created`, `rounds_opened`, `rounds_closed`, `notifications_sent`, `push_failures`
- Histogrammes: latence jobs (create/open/close), latence push, temps de requêtes critiques
- Jauges: groupes actifs, prompts éligibles moyens/jour, backlog notifications

### Alertes opérationnelles
- Job bloqué: aucune exécution depuis > 1h
- Échec massif: >10% d’échecs dans un job (fenêtre 30 min)
- Dérive horaire: >5 min de retard moyen à l’ouverture
- Taux d’échec push: >20% sur une fenêtre 15 min

### Stockage des logs/metrics
- Local/dev: console + fichiers de debug
- Prod: agrégateur (ex: Vercel/Logflare/Datadog ou équivalent), rétention 14–30 jours
- Respect RGPD: minimiser les données, anonymiser si doute
