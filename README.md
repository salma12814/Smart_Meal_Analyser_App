# SmartMeal

SmartMeal est une application web de démonstration qui analyse une photo de repas et affiche des informations nutritionnelles indicatives. Elle combine une interface React, une API Spring Boot et un service Python pour l’analyse d’images.

## Fonctionnalités

- Création de compte et connexion.
- Analyse d’images JPEG ou PNG (20 Mo maximum) avec détection de régions et classification Food-101.
- Consultation de l’historique des analyses et de détails nutritionnels.
- Suggestions de repas à partir des résultats disponibles dans le projet.

Les prédictions et estimations peuvent être inexactes. SmartMeal ne remplace pas un avis médical ou diététique.

## Technologies

- **Frontend :** React, TypeScript, Vite et Tailwind CSS.
- **API :** Java 17, Spring Boot et Spring Security.
- **Données :** PostgreSQL et Redis.
- **Analyse d’images :** Python, FastAPI, PyTorch et YOLOv8.
- **Lancement local :** Docker Compose.

## Structure

```text
frontend/              Interface web React
smeal-backend/         API Spring Boot et service FastAPI
models/                Poids des modèles et données de recommandation
notebooks/             Notebooks d’expérimentation
src/                   Ancien prototype Streamlit
```

## Démarrage local

### Prérequis

- Docker Desktop avec Docker Compose.
- Node.js et npm pour lancer l’interface web.
- Une connexion Internet lors du premier build Docker.

### 1. Configurer l’environnement

À la racine du dépôt, créez votre fichier local à partir du modèle :

```powershell
Copy-Item .env.example .env
```

Dans `.env`, définissez vos propres valeurs pour `DATABASE_PASSWORD` et `JWT_SECRET`. Utilisez un secret JWT aléatoire d’au moins 32 octets. Ne publiez pas `.env` et n’inscrivez pas de vrais secrets dans le dépôt.

### 2. Démarrer les services

Depuis la racine du dépôt :

```powershell
docker compose --env-file .env -f smeal-backend/docker-compose.yml up --build
```

L’API locale est disponible à `http://localhost:8082/api`. Son contrôle de santé se trouve à `GET /api/v1/health`.

### 3. Démarrer l’interface

Dans un autre terminal :

```powershell
cd frontend
npm install
npm run dev
```

Vite affiche l’adresse locale de l’interface, généralement `http://localhost:5173`. Pour utiliser une autre adresse d’API, définissez `VITE_API_URL` dans `frontend/.env.local`, avec `/api` à la fin de l’URL.

## Configuration

| Variable | Description |
|---|---|
| `DATABASE_PASSWORD` | Mot de passe PostgreSQL requis par Docker Compose. |
| `JWT_SECRET` | Secret utilisé pour signer les jetons d’authentification. |
| `DATABASE_URL` | URL JDBC de PostgreSQL. |
| `DATABASE_USERNAME` | Identifiant PostgreSQL. |
| `REDIS_HOST`, `REDIS_PORT` | Adresse et port de Redis. |
| `ML_API_URL` | Adresse du service d’analyse d’images. |
| `UPLOAD_PATH` | Répertoire de stockage des images reçues. |
| `FRONTEND_ORIGIN` | Origine frontend autorisée par CORS. |
| `VITE_API_URL` | URL de base de l’API utilisée par le frontend. |

Les ports locaux configurés par Docker Compose sont `8082` (API), `5000` (analyse d’images), `5433` (PostgreSQL) et `6380` (Redis). Cette configuration vise le développement local. Avant tout déploiement, configurez notamment HTTPS, des secrets propres à l’environnement et des règles réseau adaptées.

## Modèles et données

- `models/resnet18_food101.pth` : classifieur Food-101 utilisé par le service d’analyse.
- `yolov8n.pt` : poids du détecteur YOLOv8.
- `models/rl_results.json` : données utilisées par les suggestions.
- `notebooks/` : exploration des données et expérimentations ML.

Le jeu d’images Food-101 n’est pas inclus. Certains notebooks et l’ancien prototype utilisent des chemins locaux à adapter avant exécution. L’application web n’a pas besoin de ces notebooks pour démarrer.

## Utilisation des images et estimations

Le service conserve les images reçues dans son répertoire de stockage local. Prévoyez une politique de conservation et de suppression adaptée avant d’utiliser l’application avec des données personnelles ou en production.

Les classes Food-101 ne couvrent pas tous les plats. Les informations nutritionnelles sont des repères par 100 g et l’application n’estime pas la taille des portions. Le score affiché est une heuristique indicative.
