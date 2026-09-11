import base64
from time import perf_counter
from urllib.parse import urljoin
from urllib.request import Request, urlopen

from playwright.sync_api import sync_playwright


def check_website(url: str, selected_tests: list[str]) -> dict:
    results = {}
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            started = perf_counter()
            response = page.goto(url, wait_until="domcontentloaded", timeout=30000)
            load_time_ms = round((perf_counter() - started) * 1000)
            status_code = response.status if response else None
            results["page_load"] = {
                "status": "pass" if response and status_code < 400 else "warning",
                "http_status": status_code or "unknown",
                "page_title": page.title(),
                "final_url": page.url,
                "load_time_ms": load_time_ms,
            }
            try:
                screenshot = page.screenshot(type="png", full_page=True)
                results["evidence"] = {
                    "screenshot": "data:image/png;base64," + base64.b64encode(screenshot).decode("ascii"),
                    "captured_at": __import__("datetime").datetime.now().astimezone().isoformat(timespec="seconds"),
                }
            except Exception:
                results["evidence"] = {"screenshot": None, "captured_at": None}

            if "links" in selected_tests:
                links = page.locator("a[href]").evaluate_all("elements => elements.map(element => element.href)")
                useful_links = []
                for link in links:
                    if link.startswith(("http://", "https://")) and link not in useful_links:
                        useful_links.append(link)
                broken_links = []
                for link in useful_links[:10]:
                    try:
                        request = Request(link, method="HEAD", headers={"User-Agent": "AI-Web-Tester"})
                        with urlopen(request, timeout=8) as link_response:
                            if link_response.status >= 400:
                                broken_links.append(link)
                    except Exception:
                        broken_links.append(link)
                results["links"] = {
                    "status": "pass" if not broken_links else "warning",
                    "checked": min(len(useful_links), 10),
                    "broken": len(broken_links),
                    "broken_links": broken_links,
                }

            if "accessibility" in selected_tests:
                images = page.locator("img").count()
                missing_alt = page.locator("img:not([alt])").count()
                unlabeled_buttons = page.locator("button").evaluate_all("buttons => buttons.filter(button => !button.innerText.trim() && !button.getAttribute('aria-label')).length")
                results["accessibility"] = {
                    "status": "warning" if missing_alt or unlabeled_buttons else "pass",
                    "images": images,
                    "missing_alt": missing_alt,
                    "unlabeled_buttons": unlabeled_buttons,
                }

            if "buttons" in selected_tests:
                buttons = page.locator("button:visible")
                button_count = buttons.count()
                unlabeled = buttons.evaluate_all("buttons => buttons.filter(button => !button.innerText.trim() && !button.getAttribute('aria-label')).length")
                results["buttons"] = {
                    "status": "warning" if unlabeled else "pass",
                    "buttons_found": button_count,
                    "without_accessible_text": unlabeled,
                }
            return results
        finally:
            browser.close()


def fallback_summary(results: dict) -> str:
    messages = ["Testing completed."]
    page = results.get("page_load")
    if page and page.get("status") == "pass":
        messages.append("The page loaded successfully.")
    links = results.get("links")
    if links and links.get("broken", 0):
        messages.append(f"{links['broken']} broken link(s) were found.")
    accessibility = results.get("accessibility")
    if accessibility and accessibility.get("missing_alt", 0):
        messages.append(f"{accessibility['missing_alt']} image(s) are missing alt text.")
    buttons = results.get("buttons")
    if buttons and buttons.get("without_accessible_text", 0):
        messages.append(f"{buttons['without_accessible_text']} button(s) need accessible text.")
    if len(messages) == 1:
        messages.append("No selected checks reported a problem.")
    return " ".join(messages)
