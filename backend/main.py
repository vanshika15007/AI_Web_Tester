import os
import logging
from urllib.parse import urlparse

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from playwright.sync_api import TimeoutError as PlaywrightTimeoutError

from ai_service import create_summary
from tester import check_website

logger = logging.getLogger(__name__)
app = FastAPI(title="AI Web Tester API")
allowed_origins = [origin.strip() for origin in os.getenv("FRONTEND_URLS", "").split(",") if origin.strip()]
allowed_origins.extend(["http://localhost:5173", "http://127.0.0.1:5173"])
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(dict.fromkeys(allowed_origins)),
    allow_methods=["*"],
    allow_headers=["*"],
)


class TestRequest(BaseModel):
    url: str
    tests: list[str] = []
    custom_instruction: str = ""


@app.get("/api/health")
def health_check():
    key = os.getenv("GEMINI_API_KEY")
    return {"status": "ok", "ai_mode": "active" if key and key != "your_api_key_here" else "fallback"}


@app.post("/api/test")
def run_test(request: TestRequest):
    parsed_url = urlparse(request.url)
    if parsed_url.scheme not in {"http", "https"} or not parsed_url.netloc:
        raise HTTPException(status_code=400, detail="Please enter a valid HTTP or HTTPS URL.")

    allowed_tests = {"page_load", "links", "accessibility", "buttons"}
    selected_tests = [test for test in request.tests if test in allowed_tests]
    instruction = request.custom_instruction.lower()
    if instruction:
        if any(word in instruction for word in ("page", "load", "open")):
            selected_tests.append("page_load")
        if any(word in instruction for word in ("link", "url", "broken")):
            selected_tests.append("links")
        if any(word in instruction for word in ("access", "image", "alt", "wcag")):
            selected_tests.append("accessibility")
        if any(word in instruction for word in ("button", "control")):
            selected_tests.append("buttons")
    selected_tests = list(dict.fromkeys(selected_tests))
    if not selected_tests:
        raise HTTPException(status_code=400, detail="Please select at least one valid test.")

    try:
        results = check_website(request.url, selected_tests)
        summary, ai_fallback = create_summary(results)
        return {"results": results, "ai_summary": summary, "ai_fallback": ai_fallback, "ai_mode": "fallback" if ai_fallback else "active"}
    except PlaywrightTimeoutError:
        raise HTTPException(status_code=504, detail="The website took too long to respond.")
    except Exception:
        logger.exception("Website test failed for %s", request.url)
        raise HTTPException(status_code=502, detail="The website could not be tested. It may be unavailable or too slow.")
