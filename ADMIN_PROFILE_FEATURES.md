# Fonctionnalités du Profil Admin - Documentation

## 🎯 Fonctionnalités implémentées

### 1. **Édition du profil administrateur** ✅
- **Écran**: `EditAdminProfileScreen.tsx`
- **Fonctionnalités**:
  - Modification du nom d'affichage
  - Upload de photo de profil depuis la galerie
  - Prévisualisation en temps réel de la photo
  - Sauvegarde dans Firestore
  - Affichage du statut admin

### 2. **Gestion de la sécurité** ✅
- **Écran**: `SecurityScreen.tsx`
- **Fonctionnalités**:
  - Changement de mot de passe sécurisé
  - Réauthentification avant changement
  - Validation de la force du mot de passe
  - Confirmation du nouveau mot de passe
  - Indicateurs visuels des exigences
  - Gestion des erreurs Firebase

### 3. **Paramètres de l'application** ✅
- **Écran**: `SettingsScreen.tsx`
- **Fonctionnalités**:
  - **Notifications**:
    - Notifications email
    - Notifications push
    - Alertes nouveaux lieux
    - Alertes signalements
  - **Apparence**:
    - Mode sombre (préparé pour future implémentation)
  - **Compte**:
    - Accès aux informations du compte
    - Paramètres de confidentialité
  - **Support**:
    - Centre d'aide
    - Contact support
    - Conditions d'utilisation
  - **Zone de danger**:
    - Suppression du compte (avec confirmation)

### 4. **Navigation améliorée** ✅
- **Fichier**: `AdminStackNavigator.tsx`
- **Structure**:
  ```
  AdminStackNavigator
  ├── AdminTabs (Dashboard, Utilisateurs, Profil)
  ├── EditAdminProfile
  ├── Security
  └── Settings
  ```

### 5. **Affichage du profil** ✅
- **Écran**: `AdminProfileScreen.tsx` (mis à jour)
- **Améliorations**:
  - Affichage de la photo de profil uploadée
  - Bouton d'édition rapide sur l'avatar
  - Rechargement automatique des données au retour
  - Navigation vers toutes les nouvelles pages
  - Badge de rôle admin
  - Informations du compte (email, date de création)

## 📁 Structure des fichiers créés/modifiés

### Nouveaux fichiers
```
src/
├── screens/
│   ├── EditAdminProfileScreen.tsx (nouveau)
│   ├── SecurityScreen.tsx (nouveau)
│   └── SettingsScreen.tsx (nouveau)
├── navigation/
│   └── AdminStackNavigator.tsx (nouveau)
└── firebase/
    └── firebase.ts (modifié - ajout de storage)
```

### Fichiers modifiés
```
- App.tsx (utilise AdminStackNavigator)
- src/screens/AdminProfileScreen.tsx (navigation + photo de profil)
- src/firebase/firebase.ts (export de storage)
```

## 🚀 Comment utiliser

### Modifier le profil
1. Aller sur la page Profil Admin
2. Cliquer sur "Modifier le profil" ou sur l'icône d'édition de l'avatar
3. Modifier le nom d'affichage
4. Cliquer sur la photo pour choisir une nouvelle image
5. Sauvegarder les modifications

### Changer le mot de passe
1. Aller sur la page Profil Admin
2. Cliquer sur "Sécurité"
3. Entrer le mot de passe actuel
4. Entrer le nouveau mot de passe (min. 6 caractères)
5. Confirmer le nouveau mot de passe
6. Valider

### Gérer les paramètres
1. Aller sur la page Profil Admin
2. Cliquer sur "Paramètres"
3. Activer/désactiver les notifications souhaitées
4. Accéder aux différentes sections (Support, Confidentialité, etc.)

## 🔒 Sécurité

- **Réauthentification**: Le changement de mot de passe nécessite une réauthentification
- **Validation**: Les mots de passe doivent avoir au moins 6 caractères
- **Confirmation**: Double vérification pour les actions sensibles
- **Firebase Storage**: Les photos de profil sont stockées de manière sécurisée

## 📦 Dépendances utilisées

- `expo-image-picker`: Upload de photos
- `firebase/storage`: Stockage des images
- `firebase/auth`: Authentification et changement de mot de passe
- `firebase/firestore`: Sauvegarde des données utilisateur
- `@react-navigation/native-stack`: Navigation entre les écrans
- `expo-linear-gradient`: Dégradés pour l'interface

## ⚡ Fonctionnalités futures

- [ ] Mode sombre complet
- [ ] Modification de l'email
- [ ] Authentification à deux facteurs
- [ ] Export des données personnelles
- [ ] Gestion avancée des permissions
- [ ] Thèmes personnalisables
- [ ] Langues multiples

## 🐛 Notes de débogage

Si vous rencontrez des problèmes:

1. **Permissions de galerie**: Vérifier que les permissions sont accordées sur l'appareil
2. **Upload d'image**: Vérifier la configuration Firebase Storage dans la console
3. **Changement de mot de passe**: S'assurer que l'utilisateur est bien authentifié
4. **Navigation**: Vérifier que AdminStackNavigator est bien utilisé dans App.tsx

## 💡 Conseils d'utilisation

- Les modifications sont sauvegardées automatiquement dans Firestore
- La page se recharge automatiquement quand on y revient
- Toutes les actions importantes ont une confirmation
- Les erreurs sont affichées avec des messages clairs en français
