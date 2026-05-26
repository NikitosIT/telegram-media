# Changelog

All notable changes to this project will be documented in this file.

## 0.2.1 - 2026-05-26

- fixed `post.message` typing so the default collector output keeps the full raw Telegram `Message`
- fixed pending media group updates so edited messages replace older versions with the same `message_id`
- validated `timeoutMs` at collector creation time to fail fast on invalid configuration

## 0.2.0 - 2026-05-25

- added more integration examples in `examples/`
- extended exported raw Telegram types for broader Telegram Bot API coverage
