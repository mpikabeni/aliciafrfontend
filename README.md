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
