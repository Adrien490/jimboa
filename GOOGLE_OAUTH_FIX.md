# Correction de l'erreur redirect_uri_mismatch pour Google OAuth

## Problème identifié

L'erreur `redirect_uri_mismatch` se produit parce que les URLs de redirection configurées dans votre console Google Cloud ne correspondent pas aux URLs utilisées par Convex Auth.

## URLs de redirection requises

Avec Convex Auth, vous devez configurer ces URLs de redirection dans votre console Google Cloud :

### Pour le développement local :

```
http://localhost:3000/api/auth/callback/google
```

### Pour la production :

```
https://YOUR_DOMAIN/api/auth/callback/google
```

Remplacez `YOUR_DOMAIN` par votre domaine de production.

## Étapes de correction

### 1. Accédez à la Google Cloud Console

- Allez sur [Google Cloud Console](https://console.cloud.google.com/)
- Sélectionnez votre projet

### 2. Naviguez vers les identifiants OAuth

- Dans le menu de gauche, allez à **APIs & Services** > **Credentials**
- Trouvez votre client OAuth 2.0 (ID client : `966993823389-me205isdt42aln488jau96fasabab8fe.apps.googleusercontent.com`)
- Cliquez sur l'icône de modification (crayon)

### 3. Ajoutez les URLs de redirection autorisées

Dans la section **Authorized redirect URIs**, ajoutez :

```
http://localhost:3000/api/auth/callback/google
```

Si vous avez un domaine de production, ajoutez aussi :

```
https://votre-domaine.com/api/auth/callback/google
```

### 4. Sauvegardez les modifications

- Cliquez sur **Save**
- Attendez quelques minutes pour que les modifications se propagent

## Variables d'environnement corrigées

✅ Les variables d'environnement ont été mises à jour dans `convex/auth.ts` :

- `process.env.GOOGLE_CLIENT_ID` (au lieu de `AUTH_GOOGLE_ID`)
- `process.env.GOOGLE_CLIENT_SECRET` (au lieu de `AUTH_GOOGLE_SECRET`)

## Test de la configuration

Une fois les URLs de redirection ajoutées dans Google Cloud Console :

1. Redémarrez votre serveur de développement :

   ```bash
   npm run dev
   ```

2. Redéployez vos fonctions Convex :

   ```bash
   npx convex dev
   ```

3. Testez la connexion Google sur votre application

## Dépannage

Si le problème persiste :

1. **Vérifiez que vous modifiez le bon client OAuth** dans Google Cloud Console
2. **Attendez 5-10 minutes** après avoir sauvegardé les modifications
3. **Videz le cache de votre navigateur** ou testez en navigation privée
4. **Vérifiez que l'URL de redirection est exactement** : `http://localhost:3000/api/auth/callback/google`

## URLs importantes

- Console Google Cloud : https://console.cloud.google.com/
- Documentation Convex Auth : https://labs.convex.dev/auth
- Votre dashboard Convex : https://dashboard.convex.dev/d/peaceful-chinchilla-149

---

Une fois ces étapes terminées, l'authentification Google devrait fonctionner correctement !
