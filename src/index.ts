import { ApolloServer } from "apollo-server-express"
import "reflect-metadata"
import "dotenv-safe/config"
import express from "express"
import connectRedis from "connect-redis"
import cors from "cors"
import session from "express-session"
import Redis from "ioredis"
import path from "path"
import { buildSchema } from "type-graphql"
import { createConnection } from "typeorm"
import { COOKIE_NAME, PORT, __prod__ } from "./config"
import { Comment } from "./entities/Comment"
import { Issue } from "./entities/Issue"
import { Project } from "./entities/Project"
import { User } from "./entities/User"
import { PingResolver } from "./resolvers/ping"
import { UserResolver } from "./resolvers/user"
import { ProjectResolver } from "./resolvers/project"
;(async () => {
  await createConnection({
    type: "postgres",
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    synchronize: !__prod__,
    logging: !__prod__,
    entities: [User, Project, Issue, Comment],
    migrations: [path.join(__dirname, "./migrations/*")],
  })

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
      resolvers: [PingResolver, UserResolver, ProjectResolver],
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
})()
