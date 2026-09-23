# Wa-CRM Intelligence

Wa-CRM Intelligence is an AI-powered revenue intelligence platform designed specifically for businesses that conduct sales and operations over WhatsApp. It operates seamlessly as a Chrome Extension, converting unstructured WhatsApp Web conversations into structured, actionable sales intelligence and CRM data.

## 🏆 Hackathon Achievement

**This project was proudly built during the 36-hour national level hackathon, "Code With Bharat 3.0" by team Nexus Flow.**

We are thrilled to announce that **Team Nexus Flow** secured a spot in the **Top 10 among 65+ competing teams!**

**Team Nexus Flow Members:**
- Aman Sharma
- Ansh Goyal
- Akshat Chaudhary
- Anushka Chopra
- Vidita Sharma

## 🎯 What problem is it solving?

Many businesses and independent sellers manage a large volume of leads and customer interactions entirely on WhatsApp. However, extracting meaningful data from these conversations is a manual, error-prone, and time-consuming process.

**Wa-CRM Intelligence solves this by:**
- **Automating Data Entry:** Eliminating the need to manually copy-paste leads, requirements, or conversation summaries into spreadsheets or CRMs.
- **Unlocking Hidden Insights:** Analyzing raw chat text to determine lead sentiment, purchase intent, and key requirements.
- **Improving Response Times:** Suggesting context-aware replies to keep the sales pipeline moving efficiently.
- **Privacy-First Operations:** Operating entirely locally within your browser and interacting only with the currently active conversation, without scraping background data.

## 🛠️ How it is built

The platform is designed as a full-stack application consisting of the following key components:

- **Frontend (Web Dashboard):** Built using React, Vite, Tailwind CSS, and Supabase. It provides a sleek user interface to view and manage extracted leads, analytics, and CRM data.
- **Chrome Extension:** Built with modern JavaScript (Manifest V3). It injects content scripts directly into WhatsApp Web to securely read the active DOM and extract conversations with a single click.
- **Backend Server:** A Node.js and Express server that processes the extracted payload, connects to the database, and handles the backend business logic.
- **AI Engine (Model):** Responsible for analyzing conversation context, assigning lead scores, categorizing intents, and generating suggested smart replies.

## 🚀 Getting Started

*(Developer Instructions)*

### Loading the Extension
1. Go to `chrome://extensions` in Google Chrome.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the extension folder from this repository (`backend/extension`).

### Running the Backend
```bash
cd backend/backend
npm install
npm run dev
```

### Running the Frontend
```bash
cd frontend
npm install
npm run dev
```
