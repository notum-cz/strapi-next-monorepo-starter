---
sidebar_position: 12
---

# remove-azure-monitor

Remove the Azure Monitor / Application Insights telemetry from the project while keeping structured logging and tracing intact. Your apps still log and still create traces — they just stop shipping that data to Azure.

## Use it when

- You don't send telemetry to Azure and want the exporter and its configuration gone.

## What it helps solve

- Removes an unused Azure telemetry destination.
- Simplifies environment setup when the project does not send logs or traces to Azure.
- Keeps normal application logging available.

Use [remove-sentry](./remove-sentry.md) separately if Sentry should also go.
