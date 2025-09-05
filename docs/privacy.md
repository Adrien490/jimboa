# 🔐 Politique de Confidentialité (v1)

Dernière mise à jour: 2025‑01‑01

Jimboa respecte votre vie privée. Cette page décrit quelles données nous collectons, pourquoi et comment nous les protégeons.

## Données collectées
- Compte: email Google (via Supabase Auth), identifiant utilisateur
- Profil: display_name, image_url (Google ou Storage)
- Utilisation: appartenance aux groupes, participations (soumissions, commentaires, votes) et enregistrement de participation par manche (`round_participations`)
- Appareils: tokens push (iOS/Android/Web)

## Finalités
- Authentifier les utilisateurs et gérer les sessions
- Permettre la création et la gestion de groupes privés
- Offrir un rituel quotidien (manches, prompts, interactions)
- Envoyer des notifications d’ouverture si autorisées

## Partage et sous‑traitants
- Hébergement et base de données: Supabase (PostgreSQL, Auth, Storage)
- Hébergement web: Vercel (ou équivalent)
- Push provider: selon plateforme (Web Push standard, iOS/Android si applicable)

Nous ne vendons pas vos données. Les sous‑traitants traitent les données pour notre compte conformément à leurs politiques.

## Conservation
- Données de compte et de groupes: jusqu’à suppression du compte ou du groupe
- Tokens push invalides: supprimés automatiquement
- Logs: 14–30 jours en production (diagnostic)

## Sécurité
- RLS (Row Level Security) au niveau base de données
- Accès restreint aux environnements de production
- Chiffrement en transit (HTTPS)

## Vos droits
- Accéder, corriger, supprimer votre profil
- Quitter un groupe à tout moment (hors owner sans transfert)
- Révoquer les permissions push

Pour toute demande: contact à `support@jimboa.app` (adresse indicative v1).

## Cookies
- Cookies techniques pour la session et la sécurité
- Pas de cookies publicitaires

## Modifications
Nous pouvons mettre à jour cette politique. Les changements substantiels seront annoncés dans l’application.
