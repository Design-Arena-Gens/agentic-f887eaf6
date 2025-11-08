import type { NextApiRequest, NextApiResponse } from "next";
import getRawBody from "raw-body";
import MessagingResponse from "twilio/lib/twiml/MessagingResponse";

import { findInventory, getOrder, listLowStock } from "@/lib/googleSheets";

export const config = {
  api: {
    bodyParser: false
  }
};

type ParsedMessage = {
  intent: "order" | "inventory" | "low-stock" | "help" | "unknown";
  argument?: string;
};

function parseMessage(body: string | undefined): ParsedMessage {
  if (!body) {
    return { intent: "unknown" };
  }

  const trimmed = body.trim();
  const lowered = trimmed.toLowerCase();

  if (lowered.startsWith("order ")) {
    const argument = trimmed.slice(6).trim();
    return argument ? { intent: "order", argument } : { intent: "help" };
  }

  if (lowered.startsWith("inventory ")) {
    const argument = trimmed.slice(10).trim();
    return argument ? { intent: "inventory", argument } : { intent: "help" };
  }

  if (["low stock", "list low stock"].includes(lowered)) {
    return { intent: "low-stock" };
  }

  if (["help", "menu", "start"].includes(lowered)) {
    return { intent: "help" };
  }

  if (/^\d+$/u.test(trimmed)) {
    return { intent: "order", argument: trimmed };
  }

  return { intent: "unknown", argument: trimmed };
}

function buildHelpMessage(): string {
  return [
    "I can help with:",
    "• order <order id> → Status, ETA and customer info.",
    "• inventory <sku or name> → Stock levels and location.",
    "• list low stock → Items below the configured threshold.",
    "Update the Orders and Inventory sheets in Google Sheets to control responses."
  ].join("\n");
}

async function handleOrder(argument: string): Promise<string> {
  try {
    const record = await getOrder(argument);
    if (!record) {
      return `No order found for ${argument}.`;
    }

    const lines = [
      `Order ${record.order_id}`,
      record.customer_name ? `Customer: ${record.customer_name}` : "",
      record.status ? `Status: ${record.status}` : "",
      record.eta ? `ETA: ${record.eta}` : ""
    ].filter(Boolean);

    return lines.join("\n");
  } catch (error) {
    console.error("Order lookup failed:", error);
    return "Sorry, I could not reach the orders sheet.";
  }
}

async function handleInventory(argument: string): Promise<string> {
  try {
    const matches = await findInventory(argument);
    if (matches.length === 0) {
      return `No inventory records match "${argument}".`;
    }

    return matches
      .slice(0, 5)
      .map((item) =>
        [
          item.name ? `${item.name} (${item.sku ?? "N/A"})` : item.sku ?? "Unknown Item",
          `Qty: ${item.quantity ?? "?"}`,
          item.location ? `Location: ${item.location}` : undefined
        ]
          .filter(Boolean)
          .join("\n")
      )
      .join("\n\n");
  } catch (error) {
    console.error("Inventory lookup failed:", error);
    return "Sorry, I could not reach the inventory sheet.";
  }
}

async function handleLowStock(): Promise<string> {
  try {
    const items = await listLowStock();
    if (items.length === 0) {
      return "No items are below the low stock threshold.";
    }

    return (
      "Low Stock Alerts:\n\n" +
      items
        .slice(0, 10)
        .map(
          (item) =>
            `${item.name ?? item.sku} — Qty: ${item.quantity ?? "?"}${
              item.location ? ` (${item.location})` : ""
            }`
        )
        .join("\n")
    );
  } catch (error) {
    console.error("Low stock listing failed:", error);
    return "Sorry, I could not reach the inventory sheet.";
  }
}

async function parseFormBody(req: NextApiRequest): Promise<Record<string, string>> {
  const raw = await getRawBody(req);
  const body = raw.toString("utf8");
  const params = new URLSearchParams(body);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
    return;
  }

  const form = await parseFormBody(req);
  const messageBody = form.Body ?? form.body ?? "";
  const parsed = parseMessage(messageBody);

  let responseText: string;

  switch (parsed.intent) {
    case "order":
      responseText = parsed.argument
        ? await handleOrder(parsed.argument)
        : buildHelpMessage();
      break;
    case "inventory":
      responseText = parsed.argument
        ? await handleInventory(parsed.argument)
        : buildHelpMessage();
      break;
    case "low-stock":
      responseText = await handleLowStock();
      break;
    case "help":
      responseText = buildHelpMessage();
      break;
    default:
      responseText = [
        "Sorry, I did not recognise that.",
        buildHelpMessage()
      ].join("\n\n");
      break;
  }

  const twiml = new MessagingResponse();
  twiml.message(responseText);

  res.setHeader("Content-Type", "text/xml");
  res.status(200).send(twiml.toString());
}
