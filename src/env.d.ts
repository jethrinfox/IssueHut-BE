declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string
    DATABASE_USERNAME: string
    DATABASE_PASSWORD: string
    DATABASE_NAME: string
    REDIS_URL: string
    PORT: string
    SESSION_SECRET: string
    CORS_ORIGIN: string
  }
}
