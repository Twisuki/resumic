import type { Contract } from "./schema.d"
import process from "node:process"
import postgres from "@prisma/orm-postgres/runtime"
import contractJson from "./schema.json" with { type: "json" }
import "dotenv/config"

export const db = postgres<Contract>({
  contractJson,
  url: process.env.DATABASE_URL!,
})
