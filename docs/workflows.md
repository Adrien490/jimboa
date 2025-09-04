# ⚙️ Workflow d'orchestration (Jobs)

## 🔄 Principes

- **Idempotence stricte** : transitions contrôlées par `status` + clés uniques
- **Horodatage** : `open_at` et `close_at` calculés en UTC selon le **fuseau du groupe** et `drop_time`
- **Durée fixe** : `close_at = open_at + INTERVAL '24 hours'`
- **Locks** : advisory lock par `group_id` pour éviter les doubles transitions

## 📅 Création planifiée (toutes les heures)

**Objectif** : Créer automatiquement une nouvelle manche `scheduled` pour les groupes éligibles.

### Conditions de déclenchement

- La dernière manche du groupe est `closed` depuis ≥ 24h
- Le groupe est actif (`is_active = true`)

### Logique de sélection des prompts

- **Source** : Prompts locaux actifs uniquement (`group_prompts.is_active = true`)
- **Anti-répétition** : Exclusion des 7 derniers prompts utilisés par le groupe
- **Sélection** : Choix aléatoire parmi les prompts éligibles
- **Planification** : Pour la date courante dans le fuseau du groupe

## 🔓 Ouverture (toutes les 5 min)

**Objectif** : Faire passer les manches de `scheduled` → `open` à l'heure locale configurée.

### Conditions d'ouverture

- Statut de la manche : `scheduled`
- Date atteinte : Date courante ≥ `scheduled_for` dans le fuseau du groupe
- Heure atteinte : Heure courante ≥ `drop_time` du groupe

### Actions effectuées

- Transition vers le statut `open`
- Définition de `open_at` (timestamp d'ouverture)
- Calcul de `close_at` (exactement 24h après `open_at`)
- Déclenchement des notifications aux membres (si activées)

## 🔒 Fermeture (toutes les 5 min)

**Objectif** : Fermer automatiquement les manches arrivées à échéance.

### Conditions de fermeture

- Statut de la manche : `open`
- Échéance atteinte : Timestamp courant ≥ `close_at`

### Actions effectuées

- Transition vers le statut `closed`
- Archivage automatique : la manche devient consultable en lecture seule
- Fin des interactions : plus de soumissions, commentaires ou votes possibles

## 🔒 Garanties d'intégrité

### Contrôles de cohérence

- **Transitions** : Séquence stricte `scheduled → open → closed` uniquement
- **Unicité** : Une seule manche par jour et par groupe (`group_id`, `scheduled_for`)
- **Verrous** : Advisory locks pour éviter les doubles exécutions sur le même groupe
- **Idempotence** : Les jobs peuvent être relancés sans effet de bord

### Gestion des erreurs

- **Retry automatique** : Nouvelle tentative en cas d'échec ponctuel
- **Isolation** : L'échec sur un groupe n'impacte pas les autres
- **Logs détaillés** : Traçabilité complète des opérations et erreurs

## 📊 Monitoring des jobs

### Métriques à surveiller

- **Temps d'exécution** : Durée de chaque job
- **Échecs** : Nombre d'erreurs par type de job
- **Latence** : Délai entre l'heure prévue et l'exécution effective
- **Throughput** : Nombre de groupes traités par minute

### Alertes critiques

- **Job bloqué** : Aucune exécution depuis > 1h
- **Échec massif** : > 10% d'échecs sur une période
- **Dérive horaire** : Ouvertures avec > 5min de retard
