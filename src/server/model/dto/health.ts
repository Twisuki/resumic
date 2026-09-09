export interface HealthResponse {
  ok: true
  version: string
  db: "up" | "down"
}
