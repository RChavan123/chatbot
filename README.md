# Payflow demo checkout

A responsive React checkout demo with a small Flask-powered checkout assistant. Payments are simulated for the demo only; connect a payment provider such as Stripe or PayPal before accepting real payments.

## Prerequisites

- Node.js 18 or newer
- Python 3.10 or newer

## Start the Flask chatbot

From the project folder, create a virtual environment and install Flask:

```powershell
cd chatbotai
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python app.py
```

The API listens on `http://localhost:5000`. Check that it is running at `http://localhost:5000/api/health`.

## Start the React checkout

In a second terminal, from the project folder:

```powershell
npm.cmd install
npm.cmd run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`). Set `VITE_CHAT_API_URL` before starting Vite if the chatbot API is hosted elsewhere. The Flask server allows requests from `http://localhost:5173` by default; set `FRONTEND_ORIGIN` on the Flask server to the frontend's origin when you use a different host.

## Demo behavior

- The checkout form validates required browser fields and displays a local success state. It does not send payment or contact a payment processor.
- The chat widget sends questions to the Flask `/api/chat` endpoint. Answers are rule-based and run locally; no external AI service is called.
- Do not enter real card details. Use a payment provider's hosted checkout or tokenization flow for real payments; never send raw card details to this demo API.
