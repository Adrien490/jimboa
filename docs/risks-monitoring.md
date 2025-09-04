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
