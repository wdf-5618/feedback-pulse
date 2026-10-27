# FeedbackPulse — Customer Feedback Dashboard

FeedbackPulse is a small feedback dashboard for reviewing customer ratings and comments. It summarizes responses, groups ratings into clear thresholds, and keeps follow-up actions visible.

**Live demo:** [Open FeedbackPulse](https://feedback-pulse-blond.vercel.app)  
**Source code:** https://github.com/wdf-5618/feedback-pulse

## Features

- Start with eight fictional responses across different ratings, categories, and feedback channels.
- Add feedback with a customer label, date, 1–5 rating, category, source, comment, and optional follow-up action.
- Review average rating, total responses, positive-rating rate, and low-rated responses that still need follow-up.
- See rating distribution and the most common categories.
- Search comments, customer labels, response IDs, channels, and follow-up text.
- Filter by exact rating, simple sentiment group, or category; sort by newest, oldest, highest rating, or lowest rating.
- Mark follow-up as complete or reopen it.
- Export response records and follow-up status as CSV.
- Save entries to localStorage so they persist in the same browser.
- Responsive dashboard, keyboard focus styles, required-field checks, and screen-reader status messages.

## How the summary works

- Average rating is the arithmetic mean of all stored ratings and is displayed to one decimal place.
- Positive ratings are scores of 4 or 5. Neutral is 3. Needs attention is 1 or 2.
- “Needs attention” counts only 1–2 star responses that are not marked as followed up.
- Category summaries use the category selected when the response is entered.
- These labels are simple rule-based summaries. There is no AI sentiment model or automatic interpretation of free-text comments.

## Run locally

No build step or package installation is required. From the repository root, run:

~~~bash
python -m http.server 8000
~~~

Then open [http://localhost:8000](http://localhost:8000).

## Project structure

~~~text
feedback-pulse/
├── index.html   # Dashboard, visual summaries, and response dialog
├── styles.css   # Responsive dashboard and form styles
├── app.js       # Rating metrics, filters, local storage, and CSV export
└── README.md
~~~

## Implementation notes

- Built with semantic HTML, CSS, Bootstrap 5, and vanilla JavaScript.
- Feedback is rendered into DOM elements using text nodes/textContent rather than injecting comment text as HTML.
- Browser data is stored under a versioned localStorage key and normalized when restored.
- CSV fields are quoted and formula-like prefixes are neutralized before export.
- The sample data is fictional and is restored when the user selects Reset sample.

## Scope and limitations

This is a learning prototype, not a live survey system or a customer research platform. Feedback is added manually through the local form and stays in the current browser profile. It does not distribute surveys, collect submissions from other people, sync across devices, or provide shared-team access. There are no user accounts, hosted database, or backend permissions.

Do not enter confidential customer information in a public demo. A production service would need consent and retention policies, authentication, access control, secure storage, validation on the server, and clear privacy terms.

## Manual test checklist

- [x] Review the initial average, positive rate, attention count, and rating distribution.
- [x] Add a response and confirm the ratings and summary calculations update.
- [x] Confirm an empty form is blocked and a future response date is rejected.
- [x] Search feedback and combine rating, sentiment, and category filters.
- [x] Mark a low-rated response as followed up and confirm the attention count changes.
- [x] Refresh the page and confirm added responses and follow-up states persist.
- [x] Export CSV and confirm headers, comments, and follow-up status; formula-like values are neutralized.
- [x] Confirm customer text that looks like HTML is displayed as text, not executed.
- [x] Reset the demo and confirm the original fictional responses return.
- [x] Check the layout at a narrow mobile viewport and confirm no horizontal overflow.

Headless browser checks passed for the listed workflows. Source syntax and DOM wiring checks also passed. This is a workflow smoke test, not an exhaustive test across every device or browser.
