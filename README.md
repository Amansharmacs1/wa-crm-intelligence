# Wa-CRM Intelligence

Wa-CRM Intelligence is an AI-powered revenue intelligence platform for businesses that conduct sales conversations through WhatsApp. It converts unstructured WhatsApp conversations into structured and actionable sales intelligence.

## Phase 1 Scope

This phase focuses entirely on building the initial Chrome Extension to prove data extraction capabilities from WhatsApp Web.

The extension is strictly constrained to:
- Operating only on WhatsApp Web.
- Reading only the currently active conversation.
- Requiring an explicit user click to extract data.
- Converting raw DOM elements into a structured JSON representation.
- Working entirely locally (no backend or AI integration in this phase).
- Strictly following privacy guidelines (no session token extraction, no background scraping).

## Folder Structure

```
wa-crm-intelligence/
├── apps/
│   └── extension/         # Chrome Extension source code
│       ├── manifest.json  # Extension manifest (V3)
│       ├── popup.html     # Extension UI structure
│       ├── popup.css      # Extension styling
│       ├── popup.js       # Extension UI logic
│       ├── content.js     # Content script injected into WhatsApp Web
│       ├── selectors.js   # Centralized DOM selectors for extraction
│       └── icons/         # Extension icons
├── docs/                  # Documentation
├── package.json           # Monorepo configuration
└── README.md              # This file
```

## How to Load the Extension (Development)

1. Open Google Chrome.
2. Navigate to `chrome://extensions`.
3. Enable **Developer mode** (toggle switch in the top right corner).
4. Click **Load unpacked** in the top left.
5. Select the `apps/extension` folder inside this repository.

## Testing Steps

1. Load the extension as described above.
2. Open [WhatsApp Web](https://web.whatsapp.com/) in a new tab.
3. Refresh the WhatsApp Web tab to ensure the extension scripts are injected.
4. Select any active conversation (a chat where messages are visible).
5. Click on the **Wa-CRM Intelligence** extension icon in your Chrome toolbar.
6. Observe that the extension detects your active contact and the number of visible messages.
7. Click **Detect Conversation**.
8. Verify that the structured JSON representation of the conversation is displayed in the popup.
9. Try opening the extension on a non-WhatsApp tab, or without a chat selected, to verify error handling.

## Known Limitations

- **DOM Volatility**: WhatsApp Web frequently updates its HTML structure and CSS class names. The extraction logic in `selectors.js` relies on specific attributes and roles (like `[role="row"]` and `data-id`). If WhatsApp pushes a major structural update, these selectors may need to be updated.
- **Visible Messages Only**: In Phase 1, only messages currently rendered in the DOM are extracted. Scrolling up to load older history is not implemented automatically yet.
- **No Attachments**: Image, video, and document extraction is ignored to comply with Phase 1 privacy rules.
