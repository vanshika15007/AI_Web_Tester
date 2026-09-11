# AI Web Tester

AI Web Tester is a small React and FastAPI application that runs basic website checks with Playwright. It displays the results in a dashboard and uses Gemini to create a short summary when an API key is available.

## Features

- Page load check with HTTP status, title, final URL, and load time
- Link check for up to 10 HTTP or HTTPS links
- Basic accessibility check for image alt text and button labels
- Visible button count check without clicking buttons
- Optional custom instruction mapped to the supported checks
- Screenshot evidence captured by Playwright
- Gemini summary with a rule-based fallback
- Detailed report view
- URL preview, loading state, and friendly error messages

## Project Flow

1. React collects the URL and selected checks.
2. FastAPI validates the URL.
3. Playwright opens the website and runs the checks.
4. The backend captures the results and a screenshot.
5. Gemini explains the results, or the backend creates a fallback summary.
6. React displays the report.

## Tech Stack

- React and Vite
- JavaScript and CSS
- Python and FastAPI
- Uvicorn
- Playwright for Python
- Gemini API
- python-dotenv

## Setup

### Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
playwright install
python -m uvicorn main:app --reload
```

### Frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite address shown in the terminal, usually `http://localhost:5173`.

## Gemini Setup

Copy `backend/.env.example` to `backend/.env` and add your key:

```text
GEMINI_API_KEY=your_real_key_here
```

The application still works without a key. It displays a rule-based summary instead of pretending that Gemini was used. The key is only used by the backend.

## API Endpoints

### `GET /api/health`

Returns the backend status and current AI mode.

### `POST /api/test`

Accepts a URL, selected test names, and an optional custom instruction. Supported tests are:

- `page_load`
- `links`
- `accessibility`
- `buttons`

## Limitations

- This is a beginner-level project, not a complete QA platform.
- Link checking is limited to the first 10 useful links.
- Accessibility checking is basic and does not provide full WCAG compliance.
- Buttons are inspected but not clicked.
- Websites that block automated browsers may not work.
- The screenshot is only evidence of the tested page at that time.
