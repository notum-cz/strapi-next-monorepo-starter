/**
 * Telemetry bootstrap. Imported first in `src/index.ts` so configured backend
 * exporters (e.g. Azure Monitor) initialize before the rest of the server is
 * loaded and can instrument outgoing HTTP, database, and other calls.
 */
import { initializeTelemetry } from "./telemetry"

initializeTelemetry()
