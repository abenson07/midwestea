/**
 * Export Stripe transactions to CSV (READ-ONLY - no modifications to Stripe)
 *
 * Fetches all succeeded payment intents since Dec 1, 2025 and exports:
 * Customer Email | Customer Name | Customer Phone | Payment Amount | Class Item
 *
 * Usage:
 *   npm run export-stripe-transactions
 *
 * Requires .env.local with STRIPE_SECRET_KEY
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import Stripe from 'stripe';

// Load environment variables from .env.local (project root)
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

async function main() {
  if (!STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY is not set in .env.local');
    process.exit(1);
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, { typescript: true });

  // Dec 1, 2025 00:00:00 UTC
  const sinceDate = new Date('2025-12-01T00:00:00Z');
  const sinceTimestamp = Math.floor(sinceDate.getTime() / 1000);

  console.log('📥 Fetching payment intents from Stripe since Dec 1, 2025...');
  console.log('   (Read-only - no changes will be made to Stripe)\n');

  // Build map of payment_intent_id -> class item from checkout sessions (for payment link flows)
  const sessionClassMap = new Map<string, string>();
  let sessHasMore = true;
  let sessStart: string | undefined;
  while (sessHasMore) {
    const sessions = await stripe.checkout.sessions.list({
      created: { gte: sinceTimestamp },
      limit: 100,
      ...(sessStart ? { starting_after: sessStart } : {}),
    });
    for (const sess of sessions.data) {
      if (sess.status !== 'complete') continue;
      const piId =
        typeof sess.payment_intent === 'string' ? sess.payment_intent : sess.payment_intent?.id;
      if (!piId) continue;
      const classId = sess.metadata?.class_id;
      if (classId && !sessionClassMap.has(piId)) sessionClassMap.set(piId, classId);
    }
    sessHasMore = sessions.has_more;
    if (sessHasMore && sessions.data.length) sessStart = sessions.data[sessions.data.length - 1].id;
  }

  const rows: string[][] = [
    ['Customer Email', 'Customer Name', 'Customer Phone', 'Payment Amount', 'Class Item'],
  ];

  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore) {
    const paymentIntents = await stripe.paymentIntents.list({
      created: { gte: sinceTimestamp },
      limit: 100,
      expand: ['data.latest_charge'],
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });

    for (const pi of paymentIntents.data) {
      if (pi.status !== 'succeeded') continue;

      let email = pi.receipt_email || pi.metadata?.email || '';
      let name = '';
      let phone = '';

      if (pi.customer && typeof pi.customer === 'string') {
        try {
          const customer = await stripe.customers.retrieve(pi.customer);
          if (!customer.deleted) {
            email = customer.email || email;
            name = customer.name || '';
            phone = customer.phone || '';
          }
        } catch {
          // Fall back to charge billing_details or metadata
        }
      }

      // Fallback: billing details from charge (for guest checkouts)
      if ((!email || !name) && pi.latest_charge && typeof pi.latest_charge === 'object') {
        const charge = pi.latest_charge as Stripe.Charge;
        const bd = charge.billing_details;
        if (bd) {
          if (!email && bd.email) email = bd.email;
          if (!name && bd.name) name = bd.name;
          if (!phone && bd.phone) phone = bd.phone;
        }
        if (!email && charge.receipt_email) email = charge.receipt_email;
      }

      // Fallback: checkout session metadata
      if (!name && pi.metadata?.full_name) name = pi.metadata.full_name;

      const amountCents = pi.amount || 0;
      const amountFormatted = (amountCents / 100).toFixed(2);
      const currency = (pi.currency || 'usd').toUpperCase();
      const paymentAmount = `${currency} ${amountFormatted}`;

      // Class item from metadata, or from checkout session map
      const productName = pi.metadata?.productName;
      const courseCode = pi.metadata?.courseCode;
      const classId = pi.metadata?.classId || pi.metadata?.class_id;
      const classItem =
        productName ||
        (courseCode && classId ? `${courseCode}:${classId}` : null) ||
        classId ||
        sessionClassMap.get(pi.id) ||
        '';

      rows.push([
        escapeCsv(email),
        escapeCsv(name),
        escapeCsv(phone),
        escapeCsv(paymentAmount),
        escapeCsv(classItem),
      ]);
    }

    hasMore = paymentIntents.has_more;
    if (hasMore && paymentIntents.data.length > 0) {
      startingAfter = paymentIntents.data[paymentIntents.data.length - 1].id;
    }
  }

  const csv = rows.map((r) => r.join(',')).join('\n');
  const outputPath = path.resolve(__dirname, '../stripe-transactions-export.csv');
  fs.writeFileSync(outputPath, csv, 'utf-8');

  const count = rows.length - 1; // minus header
  console.log(`✅ Exported ${count} transaction(s) to ${outputPath}`);
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
