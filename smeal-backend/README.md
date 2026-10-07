# SMEAL backend

Standalone Spring Boot 3 REST API for the existing SMEAL repository. It runs at `http://localhost:8080/api`, with routes under `/v1`.

## Run

Requires Java 17+, Maven and Docker Desktop. Copy the repository-root `.env.example` to `.env`, set `DATABASE_PASSWORD` to the actual PostgreSQL password for `smeal_user`, and replace `JWT_SECRET` with a cryptographically random secret of at least 32 bytes. `.env` is gitignored. IntelliJ reads this file when the run configuration's working directory is the repository root; otherwise add these variables to the run configuration.

```powershell
docker compose up --build
```

From the repository root, run `docker compose --env-file .env -f smeal-backend/docker-compose.yml up --build`. Compose starts PostgreSQL, Redis, the FastAPI ML service and this backend. The ML image includes the repository's ResNet and YOLO weights. Health is at `GET /api/v1/health`.

If PostgreSQL reports `password authentication failed`, the backend is reaching a database but the configured password does not match. In IntelliJ, open **Run → Edit Configurations**, remove any stale `DATABASE_PASSWORD` override (or set it to the correct password), and keep the working directory at the repository root so Spring can load `.env`. To use an isolated Compose database alongside a local PostgreSQL already using port 5432, start it with `docker compose --env-file .env -f smeal-backend/docker-compose.yml up -d postgres redis`; it listens on port 5433 with the credentials from `.env`. Rebuild the IntelliJ project after configuration changes so `target/classes` is refreshed.

## ML API contract

`ML_API_URL` defaults to `http://ml-api:5000` in Compose. The included FastAPI service accepts multipart field `file` at `POST /predict/detect` and `/predict/classify`. Detection returns `objects` with `box: [x1,y1,x2,y2]`; classification returns `{ "class": "food_name", "probability": 0.9 }`. Recommendation accepts `{"selectedFoods":[...]}` at `POST /recommend` and suggests missing items from the trained RL artifact's recorded best meal.

The included `data.sql` imports the project's 101-food nutrition table from `notebooks/10_nutrition_101.ipynb`. Nutrition aggregates use per-100g values for each detected food because the current ML contract does not estimate portion sizes.

## Authenticated routes

- `POST /api/v1/auth/register` body `{ "email", "password", "name" }`
- `POST /api/v1/auth/login` body `{ "email", "password" }`
- `POST /api/v1/auth/refresh` body `{ "refreshToken" }`
- `POST /api/v1/auth/logout` with Bearer token and optional refresh token body
- `POST /api/v1/meals/analyze` multipart `image`
- `GET /api/v1/meals/{mealId}`, `GET /api/v1/meals/history?offset=0&limit=20`, `DELETE /api/v1/meals/{mealId}`
- `GET /api/v1/nutrition/foods?search=pizza&limit=50`, `GET /api/v1/nutrition/foods/{foodName}`
- `POST /api/v1/recommendations/suggest` body `{ "selectedFoods": [...] }`

The `userId` for meal operations comes from the verified JWT subject; clients cannot select another user's ID.
