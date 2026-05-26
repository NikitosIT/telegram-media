# Changelog

All notable changes to this project will be documented in this file.

## 0.2.2 - 2026-05-26

- fixed `post.message` typing so the default collector output keeps the full raw Telegram `Message`

## 0.2.1 - 2026-05-25

- fixed generic type inference when custom storage is provided without an explicit `Message` generic
- fixed pending media group updates so edited messages replace older versions with the same `message_id`
- validated `timeoutMs` at collector creation time to fail fast on invalid configuration

## 0.2.0 - 2026-05-25

- added more integration examples in `examples/`
- extended exported raw Telegram types for broader Telegram Bot API coverage
