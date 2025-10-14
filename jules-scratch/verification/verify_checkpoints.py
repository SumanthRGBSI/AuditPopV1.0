
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

        # --- VERIFICATION 1: Check for checkpoint indicator ---
        checkpoint_question = assessment_content.locator('[data-question-id="q1.2"]')
        checkpoint_indicator = checkpoint_question.locator(".checkpoint-indicator")
        expect(checkpoint_indicator).to_be_visible()
        expect(checkpoint_indicator.locator("i")).to_have_class("fas fa-shield-alt text-amber-500 mr-2")

        # --- VERIFICATION 2: Check initial critical failure state ---
        # Question 2.1 has an initial score of 1, which is below the minScore of 2
        initial_critical_failure_question = assessment_content.locator('[data-question-id="q2.1"]')
        expect(initial_critical_failure_question).to_have_class("critical-failure")

        # --- VERIFICATION 3: Change a score to trigger critical failure ---
        non_critical_checkpoint = assessment_content.locator('[data-question-id="q1.2"]')
        expect(non_critical_checkpoint).not_to_have_class("critical-failure") # Initially not critical (score is 2)

        # Change the score to 1
        low_score_radio = non_critical_checkpoint.locator('input[name="q1.2_score"][value="1"]')
        low_score_radio.check()

        # Now it should have the critical failure class
        expect(non_critical_checkpoint).to_have_class("critical-failure")

        # Take a screenshot for visual verification
        page.screenshot(path="jules-scratch/verification/verification.png")

        browser.close()

if __name__ == "__main__":
    run_verification()
