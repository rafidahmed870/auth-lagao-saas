const { defineConfig } = require("drizzle-kit");

module.exports = defineConfig({
    schema: "./src/DB/schema.js",
    out: "./src/DB/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
});