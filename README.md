# Snip — URL Shortener

A simple full-stack URL shortener.

- **backend/** — Django REST API (SQLite database)
- **frontend/** — Static HTML/CSS/JS that calls the API

## Run it locally

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
Backend runs at `http://127.0.0.1:8000`.

### Frontend
Just open `frontend/index.html` in your browser (or use `python -m http.server`
from inside the `frontend/` folder). Make sure the "Backend URL" field at the
bottom of the page points to your running backend.

## API endpoints
| Method | Endpoint          | Description                     |
|--------|-------------------|----------------------------------|
| POST   | `/api/shorten/`   | Body `{ "url": "..." }` → creates/returns a short link |
| GET    | `/api/urls/`      | Lists the 20 most recent short links |
| GET    | `/<short_code>/`  | Redirects to the original URL, counts a click |

## Hosting — see HOSTING.md for full step-by-step instructions.
