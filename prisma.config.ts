// My Car Pal — Private Cloud Prisma Config
// Multi-file schema: points to the prisma/ directory which is
// recursively searched for all *.prisma files.
// This includes both the public-core schema.prisma and the
// private-cloud cloud.prisma overlay.
// Ref: https://pris.ly/prisma-config
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma',
})
