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

| Statut     | Description              | Contexte       |
| ---------- | ------------------------ | -------------- |
| `pending`  | En attente de modération | Banque globale |
| `approved` | Validé et utilisable     | Banque globale |
| `rejected` | Refusé avec feedback     | Banque globale |
| `archived` | Retiré de la circulation | Banque globale |

### Statuts des membres

| Statut     | Description                     | Permissions |
| ---------- | ------------------------------- | ----------- |
| `active`   | Membre actif du groupe          | Toutes      |
| `inactive` | Membre temporairement désactivé | Aucune      |
| `banned`   | Membre banni du groupe          | Aucune      |
| `left`     | Membre ayant quitté le groupe   | Aucune      |
