import React, { useEffect, useRef, useState } from 'react';

const chatEndpoint = import.meta.env.VITE_CHAT_API_URL || 'http://localhost:5000/api/chat';

function Icon({ name, size = 20, strokeWidth = 1.8 }) {
  const shared = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  const paths = {
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3" /><path d="M12 14v3" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    card: <><rect x="2" y="4" width="20" height="16" rx="3" /><path d="M2 10h20" /></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
    help: <><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></>,
    close: <><path d="m18 6-12 12" /><path d="m6 6 12 12" /></>,
    send: <><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></>,
    sparkle: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" /><path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z" /></>,
  };

  return <svg {...shared}>{paths[name]}</svg>;
}

function BrandMark() {
  return <span className="brand-mark" aria-hidden="true"><span /></span>;
}

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi there! 👋 I’m Flow, your checkout assistant. What can I help you with?' },
  ]);
  const endOfMessages = useRef(null);

  useEffect(() => {
    endOfMessages.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  async function sendMessage(text = draft) {
    const message = text.trim();
    if (!message || isSending) return;

    setDraft('');
    setMessages((current) => [...current, { role: 'user', text: message }]);
    setIsSending(true);

    try {
      const response = await fetch(chatEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'The assistant is unavailable.');
      setMessages((current) => [...current, { role: 'assistant', text: result.reply }]);
    } catch {
      setMessages((current) => [
        ...current,
        { role: 'assistant', text: 'I can’t reach the help service right now. Please try again in a moment.' },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      {isOpen && (
        <section className="chat-panel" aria-label="Chat with Flow">
          <header className="chat-header">
            <div className="chat-avatar"><Icon name="sparkle" size={18} /></div>
            <div className="chat-heading">
              <strong>Flow assistant</strong>
              <span><i /> Here to help</span>
            </div>
            <button className="chat-close" type="button" aria-label="Close chat" onClick={() => setIsOpen(false)}>
              <Icon name="close" size={19} />
            </button>
          </header>
          <div className="chat-messages" aria-live="polite">
            <div className="chat-day">TODAY</div>
            {messages.map((message, index) => (
              <div className={`message-row ${message.role}`} key={`${index}-${message.role}`}>
                {message.role === 'assistant' && <div className="message-avatar"><Icon name="sparkle" size={14} /></div>}
                <p className="message-bubble">{message.text}</p>
              </div>
            ))}
            {isSending && <div className="typing-indicator" aria-label="Flow is typing"><i /><i /><i /></div>}
            <div ref={endOfMessages} />
          </div>
          {messages.length === 1 && (
            <div className="suggested-questions">
              <span>QUICK QUESTIONS</span>
              {['Is this checkout secure?', 'What is your refund policy?'].map((question) => (
                <button key={question} type="button" onClick={() => sendMessage(question)}>{question}<Icon name="arrow" size={14} /></button>
              ))}
            </div>
          )}
          <form className="chat-composer" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}>
            <input
              aria-label="Type your message"
              placeholder="Write a message..."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              disabled={isSending}
            />
            <button type="submit" aria-label="Send message" disabled={!draft.trim() || isSending}>
              <Icon name="send" size={17} />
            </button>
          </form>
          <div className="chat-footer">Powered by Flow AI <span>·</span> Your chat stays private</div>
        </section>
      )}
      <button className={`chat-launcher ${isOpen ? 'is-open' : ''}`} type="button" aria-label={isOpen ? 'Close help chat' : 'Open help chat'} onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? <Icon name="close" size={23} /> : <><Icon name="help" size={22} /><span>Need help?</span></>}
      </button>
    </>
  );
}

function App() {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentComplete, setPaymentComplete] = useState(false);

  function handlePayment(event) {
    event.preventDefault();
    setPaymentComplete(true);
  }

  return (
    <div className="page-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Payflow home"><BrandMark /><span>payflow</span></a>
        <div className="header-security"><Icon name="lock" size={15} /><span>Secure checkout</span></div>
        <a className="header-help" href="mailto:help@payflow.example">Need help?</a>
      </header>

      <main id="top" className="checkout-layout">
        <section className="checkout-main" aria-labelledby="checkout-title">
          <div className="breadcrumb"><span>Cart</span><i /><span>Information</span><i /><strong>Payment</strong></div>
          <div className="checkout-intro">
            <span className="eyebrow"><span /> ONE LAST STEP</span>
            <h1 id="checkout-title">Make it <span>official.</span></h1>
            <p>You’re seconds away from your next big idea.</p>
          </div>

          {paymentComplete ? (
            <section className="success-card" role="status">
              <div className="success-icon"><Icon name="check" size={25} /></div>
              <h2>You're all set!</h2>
              <p>This demo checkout is complete. No payment was processed and no card details were sent.</p>
              <button type="button" className="text-button" onClick={() => setPaymentComplete(false)}>Back to checkout</button>
            </section>
          ) : (
            <form onSubmit={handlePayment}>
              <section className="form-section">
                <div className="section-heading">
                  <div className="step-number">01</div>
                  <div><h2>Contact information</h2><p>Where should we send your receipt?</p></div>
                </div>
                <label className="field-label" htmlFor="email">Email address</label>
                <input className="form-input" id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
                <label className="checkbox-label"><input type="checkbox" defaultChecked /><span className="custom-checkbox"><Icon name="check" size={13} /></span><span>Keep me in the loop with product updates</span></label>
              </section>

              <section className="form-section payment-section">
                <div className="section-heading">
                  <div className="step-number">02</div>
                  <div><h2>Payment method</h2><p>All transactions are encrypted and secure.</p></div>
                </div>
                <div className="payment-options">
                  <button type="button" className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`} onClick={() => setPaymentMethod('card')}>
                    <span className="radio-indicator" /><Icon name="card" size={19} /><span>Card</span>
                    <span className="card-brands"><b>VISA</b><b>MC</b></span>
                  </button>
                  <button type="button" className={`payment-option ${paymentMethod === 'paypal' ? 'selected' : ''}`} onClick={() => setPaymentMethod('paypal')}>
                    <span className="radio-indicator" /><span className="paypal-wordmark">Pay<span>Pal</span></span><span className="paypal-caption">PayPal</span>
                  </button>
                </div>
                {paymentMethod === 'card' ? (
                  <div className="card-fields">
                    <label className="field-label" htmlFor="card-number">Card number</label>
                    <div className="input-with-icon"><input id="card-number" className="form-input" name="card-number" inputMode="numeric" autoComplete="cc-number" placeholder="1234  5678  9012  3456" required /><Icon name="lock" size={16} /></div>
                    <div className="field-row">
                      <div><label className="field-label" htmlFor="expiry">Expiry date</label><input id="expiry" className="form-input" name="expiry" autoComplete="cc-exp" placeholder="MM / YY" required /></div>
                      <div><label className="field-label" htmlFor="cvc">Security code</label><input id="cvc" className="form-input" name="cvc" inputMode="numeric" autoComplete="cc-csc" placeholder="CVC" required /></div>
                    </div>
                    <label className="field-label" htmlFor="card-name">Name on card</label>
                    <input id="card-name" className="form-input" name="card-name" autoComplete="cc-name" placeholder="Full name" required />
                  </div>
                ) : (
                  <div className="paypal-notice"><span className="paypal-wordmark">Pay<span>Pal</span></span><span>You’ll continue to PayPal in a real checkout. This demo will not redirect or process a payment.</span></div>
                )}
              </section>

              <div className="demo-notice"><Icon name="shield" size={17} /><span><strong>Demo checkout</strong> — no real payment will be taken.</span></div>
              <button className="submit-button" type="submit"><Icon name="lock" size={17} /><span>Complete demo checkout</span><Icon name="arrow" size={17} /></button>
              <p className="terms-copy">By continuing, you agree to our <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.</p>
            </form>
          )}

          <div className="trust-strip"><span><Icon name="shield" size={17} />256-bit SSL encryption</span><i /><span><Icon name="check" size={17} />Trusted by 12,000+ creators</span></div>
        </section>

        <aside className="order-card" aria-label="Order summary">
          <div className="order-card-top"><span className="order-label">YOUR ORDER</span><span className="order-badge"><Icon name="check" size={12} /> RESERVED FOR YOU</span></div>
          <div className="product-art">
            <div className="art-glow" />
            <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
            <div className="art-sparkle sparkle-one">✳</div><div className="art-sparkle sparkle-two">✦</div>
            <div className="product-cube"><BrandMark /></div>
            <span className="art-caption">THE CREATOR TOOLKIT</span>
          </div>
          <div className="product-info">
            <div><h2>The Creator Toolkit</h2><p>Annual plan · billed yearly</p></div>
            <strong>$149<span>.00</span></strong>
          </div>
          <div className="order-divider" />
          <div className="order-line"><span>Subtotal</span><span>$149.00</span></div>
          <div className="order-line"><span>Tax</span><span className="tax-note">Calculated at next step</span></div>
          <div className="order-divider total-divider" />
          <div className="order-total"><span>Total due today</span><strong><small>USD</small> $149.00</strong></div>
          <div className="order-note"><span className="note-icon"><Icon name="sparkle" size={16} /></span><p><strong>A little something extra</strong><br />You also get lifetime access to all future toolkit updates.</p></div>
          <div className="guarantee"><div className="guarantee-icon"><Icon name="shield" size={19} /></div><p><strong>Love it or it’s on us.</strong><br />Try it risk-free with our 30-day money-back guarantee.</p></div>
          <div className="order-secure"><Icon name="lock" size={14} /> SECURE, ENCRYPTED CHECKOUT</div>
        </aside>
      </main>
      <footer className="site-footer"><BrandMark /><span>Thoughtfully made for the makers.</span><span className="footer-links"><a href="#privacy">Privacy</a><a href="#terms">Terms</a><span>© 2025 Payflow</span></span></footer>
      <ChatWidget />
    </div>
  );
}

export default App;
