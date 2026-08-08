require('dotenv').config();
const app = require("./src/server");
const redisClient = require("./src/Utils/RedisClient");

PORT = process.env.APP_PORT ?? 5000;

app.listen(PORT, "0.0.0.0", async() => {
    console.log("========== APPLICATION RUNNING ==========");
    
    // Redis Connection Check
    try {
        await redisClient.connect();
        console.log("✅ Redis Connected!");
    } catch (error) {
        console.log("❌ Redis Connection Failed!")
    }

    console.log(`Application Running Under Port:${PORT}`);

    console.log("=========================================");
});