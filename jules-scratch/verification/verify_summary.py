
import os
from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Get the absolute path to the index.html file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.abspath(os.path.join(current_dir, '..', '..'))
        index_html_path = os.path.join(project_root, 'index.html')

        # Navigate to the local file
        page.goto(f'file://{index_html_path}')

        # Wait for the assessment content to be visible
        assessment_content = page.locator("#assessment-content")
        expect(assessment_content).to_be_visible()

        # --- VERIFICATION 1: Summary is visible and lists the correct critical questions ---
        critical_summary_section = assessment_content.locator("#critical-summary-section")
        expect(critical_summary_section).to_be_visible()

        # Check that the correct number of critical items are listed
        critical_items = critical_summary_section.locator(".critical-summary-item")
        expect(critical_items).to_have_count(2) # q2.1 and q4.2 are initially critical

        # --- VERIFICATION 2: Summary disappears when critical failures are resolved ---
        critical_question = assessment_content.locator('[data-question-id="q2.1"]')

        # Change the score to be non-critical
        non_critical_radio = critical_question.locator('input[name="q2.1_score"][value="3"]')
        non_critical_radio.check()

        # Now only one critical item should be listed
        expect(critical_items).to_have_count(1)

        # --- VERIFICATION 3: Clicking a summary item scrolls to the question ---
        # Note: Playwright can't easily verify scroll position, but we can verify the highlight
        summary_item_to_click = critical_summary_section.locator('[data-question-id="q4.2"]')
        summary_item_to_click.click()

        # Check that the question is highlighted
        question_to_highlight = assessment_content.locator('[data-question-id="q4.2"]')
        expect(question_to_highlight).to_have_class("highlight-question")

        # Take a screenshot for visual verification
        page.screenshot(path="jules-scratch/verification/verification.png")

        browser.close()

if __name__ == "__main__":
    run_verification()
