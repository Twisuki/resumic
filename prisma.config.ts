import process from "node:process"
import { definePrismaConfig } from "@prisma/cli-engine"
import { defineConfig as ormConfig } from "@prisma/orm-postgres/config"
import "dotenv/config"

export default definePrismaConfig({
  orm: ormConfig({
    contract: "./prisma/schema.prisma",
    db: {
      connection: process.env.DATABASE_URL!,
    },
  }),
})
