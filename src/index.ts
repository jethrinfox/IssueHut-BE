import { ApolloServer } from "apollo-server-express"
import connectRedis from "connect-redis"
import cors from "cors"
import "dotenv-safe/config"
import express from "express"
import session from "express-session"
import Redis from "ioredis"
import path from "path"
import "reflect-metadata"
import { buildSchema } from "type-graphql"
import { createConnection } from "typeorm"
import { COOKIE_NAME, PORT, __prod__ } from "./config"
import { User } from "./entities/User"
import { PingResolver } from "./resolvers/ping"
import { UserResolver } from "./resolvers/user"

const main = async () => {
  const conn = await createConnection({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: __prod__,
    logging: true,
    entities: [User],
    migrations: [path.join(__dirname, "./migrations/*")],
  })

  await conn.runMigrations()

  const RedisStore = connectRedis(session)
  const redis = new Redis(process.env.REDIS_URL)

  const app = express()

  app.set("trust proxy", 1)
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    }),
  )
  app.use(
    session({
      name: COOKIE_NAME,
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        secure: __prod__,
        sameSite: "lax",
        domain: __prod__ ? ".jethrinfox.ddns.net" : undefined,
      },
    }),
  )

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PingResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
      redis,
    }),
  })

  apolloServer.applyMiddleware({ app, cors: false })

  app.get("/", (_, res) => res.redirect("/graphql"))

  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`),
  )
}

main()
