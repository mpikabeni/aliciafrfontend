# Alicia Mini Apps — Frontend connecté

Frontend basé sur les 3 fichiers Alicia Mini Apps fournis par l'utilisateur.

Backend configuré :
https://aliciaminipps.onrender.com

Fichiers :
- index.html
- style.css
- app.js

L'intégration :
- identifie l'utilisateur via Telegram WebApp
- synchronise/crée son compte via POST /users
- récupère les crédits via GET /users/{telegram_id}
- prépare les paiements via POST /payments/create
- permet de vérifier le statut via GET /payments/{payment_id}

Important :
Le frontend ne contient aucun token secret.
La création d'une vraie facture Telegram Stars doit encore être reliée au bot Telegram côté serveur après confirmation du paiement.


Logo du splash : assets/nexa-logo.png


Correctif: logo de secours ajouté pour les photos de profil Telegram indisponibles.


## Ajouts
- ID admin récupéré automatiquement depuis Telegram.
- Photo Telegram utilisée quand `photo_url` est fournie par Telegram WebApp.
- Section de paiement Telegram Stars ajoutée.
- Le backend doit renvoyer `invoice_url` depuis `/payments/create` pour que `Telegram.WebApp.openInvoice()` puisse ouvrir la facture réelle.
