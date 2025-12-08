# Daily Log Cron Worker

This Cloudflare Worker runs daily at midnight UTC to insert a log entry into the Supabase `logs` table.

## Setup

1. **Apply the database migration** (if not already done):
   ```bash
   npm run apply-migrations
   ```

2. **Set environment variables** in your Cloudflare Worker:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

   You can set these via:
   - Wrangler secrets: `wrangler secret put SUPABASE_URL` and `wrangler secret put SUPABASE_SERVICE_ROLE_KEY`
   - Or in the Cloudflare dashboard under Workers & Pages → Your Worker → Settings → Variables

3. **Deploy the worker**:
   ```bash
   cd apps/cron-worker
   npm install
   npm run deploy
   ```

## Testing

### Manual Testing (via Script)
Run the script directly:
```bash
npm run insert-daily-log
```

### Manual Testing (via Worker HTTP Endpoint)
After deploying, you can trigger the worker manually via HTTP:
```bash
curl -X POST https://midwestea-cron-worker.YOUR_SUBDOMAIN.workers.dev
```

### Testing Locally
```bash
cd apps/cron-worker
npm run dev
```

Then trigger it manually via:
```bash
curl -X POST http://localhost:8787
```

## Cron Schedule

The worker is configured to run daily at midnight UTC (`0 0 * * *`).

To change the schedule, edit `wrangler.jsonc`:
```jsonc
"triggers": {
  "crons": [
    "0 0 * * *"  // Change this to your desired schedule
  ]
}
```

Cron format: `minute hour day month weekday`
- `0 0 * * *` = Every day at midnight UTC
- `0 12 * * *` = Every day at noon UTC
- `0 0 * * 0` = Every Sunday at midnight UTC

## Monitoring

View logs in real-time:
```bash
cd apps/cron-worker
npm run tail
```

Or check the Cloudflare dashboard under Workers & Pages → Your Worker → Logs.









