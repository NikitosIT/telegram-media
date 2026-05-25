# Examples

This folder contains integration-focused examples for `telegram-media`.

Current examples:

- `express/prisma-ingestion.ts` - save normalized Telegram posts to a database
- `express/worker-pipeline.ts` - pass collected posts into a worker-style pipeline
- `bullmq/producer.ts` - enqueue collected posts into a BullMQ queue
- `bullmq/worker.ts` - process queued Telegram posts in a BullMQ worker
- `bullmq/queue.ts` - create the BullMQ queue with retries and cleanup policy
- `bullmq/shared.ts` - shared queue config and media fields
- `nestjs/ingestion.service.ts` - integrate the collector into a NestJS service
- `nestjs/ingestion.schema.ts` - example Mongoose schema for collected Telegram posts
- `nestjs/ingestion.module.ts` - register the Mongoose model used by the NestJS example
- `telegraf/bot.ts` - feed Telegraf updates into telegram-media from bot middleware
- `grammy/bot.ts` - feed grammY updates into telegram-media from bot middleware

Install example-only dependencies from this folder:

```bash
npm install
```

Type-check all examples:

```bash
npm run typecheck
```
