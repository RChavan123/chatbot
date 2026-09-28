"""Local, rule-based checkout help API; no payment data is processed here."""

import os
import re

from flask import Flask, jsonify, request

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024

ALLOWED_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")

ANSWERS = (
    (r"\b(secure|security|safe|encrypted|encryption|card details)\b",
     "Your connection to this demo is protected with HTTPS when deployed. This checkout is only a demo: it does not process payments or send/store card details."),
    (r"\b(refund|money.?back|return|guarantee)\b",
     "The Creator Toolkit comes with a 30-day money-back guarantee. Contact help@payflow.example with your order details if you need a hand."),
    (r"\b(price|cost|total|how much|tax|billing)\b",
     "The Creator Toolkit is $149.00 USD for one year. Any applicable tax is calculated at the next step in a real checkout. This demo does not charge you."),
    (r"\b(paypal|payment method|payment|card|visa|mastercard)\b",
     "You can choose card or PayPal in the demo checkout. Neither option contacts a payment processor or takes a real payment."),
    (r"\b(receipt|email|confirmation)\b",
     "In a real checkout, your receipt would be sent to the email address you provide. This demo does not collect or send your information."),
    (r"\b(toolkit|included|features|updates|creator)\b",
     "The Creator Toolkit includes lifetime access to future toolkit updates, alongside a one-year plan."),
    (r"\b(hello|hi|hey|help)\b",
     "Hi! I can answer questions about checkout security, pricing, payment methods, the refund guarantee, or what’s included. What would you like to know?"),
)


@app.after_request
def add_cors_headers(response):
    origin = request.headers.get("Origin")
    if origin == ALLOWED_ORIGIN or origin == ALLOWED_ORIGIN.replace("localhost", "127.0.0.1"):
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Vary"] = "Origin"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    return response


@app.route("/api/chat", methods=["POST", "OPTIONS"])
def chat():
    if request.method == "OPTIONS":
        return ("", 204)

    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify(error="Send a JSON object containing a message."), 400

    message = payload.get("message")
    if not isinstance(message, str) or not message.strip():
        return jsonify(error="Please enter a message."), 400
    if len(message) > 1000:
        return jsonify(error="Messages must be 1000 characters or fewer."), 400

    normalized_message = re.sub(r"\s+", " ", message.strip().lower())
    for pattern, answer in ANSWERS:
        if re.search(pattern, normalized_message):
            return jsonify(reply=answer)

    return jsonify(
        reply="I’m not sure about that one yet. I can help with checkout security, pricing, payment methods, refunds, or what’s included."
    )


@app.get("/api/health")
def health():
    return jsonify(status="ok")


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.environ.get("PORT", "5000")), debug=False)
