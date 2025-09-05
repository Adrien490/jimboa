# 📚 Glossaire

## 🎯 Termes métier

| Terme          | Définition                                       | Exemple                                   |
| -------------- | ------------------------------------------------ | ----------------------------------------- |
| **Prompt**     | Consigne quotidienne (question, vote, challenge) | "Quel est votre plat préféré ?"           |
| **Round**      | Manche quotidienne d'un groupe                   | Round du 04/01/2025 pour "Les Copains"    |
| **Soumission** | Réponse d'un membre au prompt                    | Texte + image en réponse                  |
| **Archivage**  | Consultation des manches fermées                 | Toutes les contributions restent visibles |

## 👥 Rôles & Permissions

| Rôle            | Permissions                                                                                         | Contraintes                                          |
| --------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **App Creator** | Modération banque globale + administration système + accès exclusif banque globale                  | Email défini dans `.env`, seul accès interface admin |
| **Owner**       | Gestion groupe + prompts locaux + modération suggestions locales (pas d'accès banque globale en v1) | Unique par groupe, non révoquable sans transfert     |
| **Admin**       | Prompts locaux + modération suggestions locales + gestion membres                                   | Nommé par owner                                      |
| **Member**      | Participation + interactions + suggestions (vers groupe ET vers global)                             | Par défaut                                           |

## 🔧 Termes techniques

| Terme                         | Définition                                         | Usage                                 |
| ----------------------------- | -------------------------------------------------- | ------------------------------------- |
| **RLS**                       | Row Level Security - Contrôle d'accès niveau ligne | Visibilité conditionnelle des données |
| **Soft Delete**               | Suppression logique (marquage, non suppression)    | Modération admin des contenus         |
| **Advisory Lock**             | Verrou applicatif pour éviter la concurrence       | Synchronisation des jobs              |
| **Visibilité conditionnelle** | Contenu visible seulement après participation      | Mécanisme de gamification centrale    |

## 📊 États et statuts

### Statuts des rounds

| Statut      | Description                             | Transitions possibles |
| ----------- | --------------------------------------- | --------------------- |
| `scheduled` | Manche planifiée, pas encore ouverte    | → `open`              |
| `open`      | Manche active, participations possibles | → `closed`            |
| `closed`    | Manche fermée, consultation seule       | Aucune                |

### Statuts des prompts

| Statut     | Description                          | Contexte                 |
| ---------- | ------------------------------------ | ------------------------ |
| `pending`  | En attente de modération             | Global (et suggestions)  |
| `approved` | Validé et sélectionnable (si activé) | Global et local          |
| `rejected` | Refusé avec feedback                 | Global (modération)      |
| `archived` | Retiré du catalogue (long terme)     | Global et local          |

### Activation des prompts (`is_enabled`)

- Champ booléen qui permet d'activer/désactiver un prompt sans changer son statut.
- Utilisation principale: prompts locaux (gestion owner/admin).
- Sélection locale = `status='approved'` ET `is_enabled=true`.

### Statuts des membres

| Statut     | Description                     | Permissions |
| ---------- | ------------------------------- | ----------- |
| `active`   | Membre actif du groupe          | Toutes      |
| `inactive` | Membre temporairement désactivé | Aucune      |
| `banned`   | Membre banni du groupe          | Aucune      |
| `left`     | Membre ayant quitté le groupe   | Aucune      |
