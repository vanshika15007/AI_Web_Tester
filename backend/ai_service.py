import json
import os
from urllib.request import Request, urlopen

from dotenv import load_dotenv

from tester import fallback_summary

load_dotenv()


def create_summary(results: dict) -> tuple[str, bool]:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_api_key_here":
        return fallback_summary(results), True

    ai_results = {key: value for key, value in results.items() if key != "evidence"}
    prompt = (
        "Write a short, beginner-friendly website testing summary. Explain what passed, "
        "what needs attention, why it matters, and one simple recommendation. "
        "Only use facts in this JSON. Never invent results. JSON results:\n" + json.dumps(ai_results)
    )
    payload = json.dumps({"contents": [{"parts": [{"text": prompt}]}]}).encode("utf-8")
    request = Request(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + api_key,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urlopen(request, timeout=20) as response:
            data = json.loads(response.read().decode("utf-8"))
        text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
        return text, False
    except Exception:
        return fallback_summary(results), True
