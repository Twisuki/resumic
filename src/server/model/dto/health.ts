export interface HealthResponse {
  hello: string
  ok: boolean
  db: "up" | "down"
}
