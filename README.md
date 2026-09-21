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

## Phase 2: Local Backend & Mock Analysis

In this phase, we added a local Express backend server that receives the extracted conversation from the Chrome extension, validates the payload, and returns structured mock intelligence.

### Backend Setup and Installation

1. Navigate to the backend directory:
   ```bash
   cd apps/server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
4. Start the development server (runs on port 5050 by default):
   ```bash
   npm run dev
   ```
   *Note for macOS users: If port 5050 is occupied by the "AirPlay Receiver", you can either turn off AirPlay Receiver in System Settings > General > AirDrop & Handoff, or change the `PORT` in `.env` and `apps/extension/config.js` to `5001`.*

### Testing the Backend Independently

Verify the backend is healthy:
```bash
curl http://localhost:5050/api/health
```

Simulate an analysis request:
```bash
curl -X POST http://localhost:5050/api/leads/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "contactName": "Rahul Mehta",
    "source": "whatsapp-web",
    "messages": [
      {
        "sender": "customer",
        "text": "Can I schedule a site visit?"
      }
    ]
  }'
```

### Testing the Complete Phase 2 Workflow

1. Start the backend server (`npm run dev`).
2. Reload the Chrome extension: Go to `chrome://extensions`, find Wa-CRM Intelligence, and click the refresh (↻) icon.
3. Open a conversation in WhatsApp Web and refresh the page.
4. Open the extension popup. It will now have an **"Analyze This Lead"** button.
5. Click the button to trigger extraction. The extension will send the data to your local backend.
6. Observe the mock analysis response (Score, Category, Summary, Intent, Reply).
7. Test the **Copy Suggested Reply** button.
8. To test the backend offline error handling, simply stop the backend server (`Ctrl+C`) and try clicking the button again.
