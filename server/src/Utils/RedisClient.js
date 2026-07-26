const { createClient } = require("redis")

const REDIS_URL = process.env.REDIS_URL ?? null;
if (!REDIS_URL) {
    throw new Error("DATABASE_URL is not defined in the environment variables.")
}

const redisClient = createClient({
    url: REDIS_URL
});
redisClient.on("error", (err) => console.log("Redis Client Error:", err));

module.exports = redisClient;