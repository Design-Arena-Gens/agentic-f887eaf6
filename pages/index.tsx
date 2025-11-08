import Head from "next/head";

const steps = [
  {
    title: "1. Connect WhatsApp Webhook",
    description:
      "Point your Twilio WhatsApp sandbox or Meta Cloud API inbound webhook to /api/whatsapp. Use POST and ensure messages are sent as application/x-www-form-urlencoded."
  },
  {
    title: "2. Provide Google Sheets Access",
    description:
      "Create a service account, share the spreadsheet with it, and set GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_SHEETS_ID in your deployment environment."
  },
  {
    title: "3. Structure Your Sheet",
    description:
      "Add sheets named Orders and Inventory. Orders should include columns: order_id, customer_name, status, eta. Inventory should include columns: sku, name, quantity, location."
  },
  {
    title: "4. Ask Questions",
    description:
      "Send WhatsApp messages like 'order 12345' or 'inventory sku-1'. You can also ask 'list low stock' to see items under the low stock threshold."
  }
];

export default function Home() {
  return (
    <>
      <Head>
        <title>WhatsApp Order Assistant</title>
        <meta
          name="description"
          content="Automated WhatsApp assistant connected to Google Sheets for order tracking and inventory lookups."
        />
      </Head>
      <main className="screen">
        <section className="hero">
          <h1>WhatsApp Order &amp; Inventory Assistant</h1>
          <p>
            Provide instant order status and inventory answers over WhatsApp using your Google Sheet as the
            single source of truth.
          </p>
          <div className="cta-card">
            <div className="cta">
              <span>Webhook URL</span>
              <code>/api/whatsapp</code>
            </div>
            <div className="cta">
              <span>Google Sheet Fields</span>
              <code>Orders, Inventory</code>
            </div>
          </div>
        </section>

        <section className="steps">
          {steps.map((step) => (
            <article key={step.title}>
              <h2>{step.title}</h2>
              <p>{step.description}</p>
            </article>
          ))}
        </section>

        <section className="faq">
          <h2>Supported Prompts</h2>
          <ul>
            <li>
              <code>order &lt;order id&gt;</code> — Returns the order status, customer name, and ETA.
            </li>
            <li>
              <code>inventory &lt;sku or name&gt;</code> — Reports current quantity and location.
            </li>
            <li>
              <code>list low stock</code> — Lists items below the configured threshold.
            </li>
            <li>
              <code>help</code> — Summarises available commands.
            </li>
          </ul>
          <p className="note">
            Configure <code>LOW_STOCK_THRESHOLD</code> (defaults to 5) to tune the low stock alert level.
          </p>
        </section>
      </main>
      <style jsx>{`
        .screen {
          max-width: 960px;
          padding: 48px 24px 96px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 48px;
        }

        .hero {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        h1 {
          font-size: clamp(24px, 5vw, 48px);
          margin: 0;
          font-weight: 700;
        }

        p {
          margin: 0;
          color: rgba(249, 250, 251, 0.84);
          line-height: 1.7;
        }

        .cta-card {
          display: grid;
          gap: 12px;
          margin-top: 16px;
        }

        .cta {
          background: var(--soft);
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          border: 1px solid rgba(6, 182, 212, 0.25);
        }

        .cta span {
          font-size: 14px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: rgba(249, 250, 251, 0.64);
        }

        .cta code {
          font-size: 20px;
          background: transparent;
          color: var(--accent);
        }

        .steps {
          display: grid;
          gap: 18px;
        }

        .steps article {
          background: rgba(31, 41, 55, 0.7);
          border-radius: 12px;
          padding: 20px 24px;
          border: 1px solid rgba(31, 41, 55, 0.6);
          transition: border 0.2s ease;
        }

        .steps article:hover {
          border-color: rgba(6, 182, 212, 0.4);
        }

        h2 {
          margin: 0;
          font-size: 20px;
          color: var(--accent);
        }

        .faq {
          background: rgba(6, 182, 212, 0.08);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid rgba(6, 182, 212, 0.24);
        }

        ul {
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        li {
          line-height: 1.6;
        }

        code {
          background: rgba(6, 182, 212, 0.15);
          padding: 2px 6px;
          border-radius: 6px;
          font-family: "JetBrains Mono", Menlo, Monaco, Consolas, monospace;
        }

        .note {
          margin-top: 18px;
          font-size: 14px;
          color: rgba(249, 250, 251, 0.6);
        }

        @media (min-width: 768px) {
          .cta-card {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .steps {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </>
  );
}
