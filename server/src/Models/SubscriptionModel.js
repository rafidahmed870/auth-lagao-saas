const { newsletterSubscriptions } = require("../DB/schema");
const { db } = require("../DB/database"); // assuming you have db connection
const { eq } = require("drizzle-orm");

exports.subscribeNewsletter = async (email) => {
    // Check if email already exists
    const existing = await db
        .select()
        .from(newsletterSubscriptions)
        .where(eq(newsletterSubscriptions.email, email))
        .limit(1);

    if (existing.length > 0) {
        return { 
            success: false, 
            message: "Email already subscribed", 
            data: existing[0] 
        };
    }

    const subscribe = await db
        .insert(newsletterSubscriptions)
        .values({ email })
        .returning();

    return { 
        success: true, 
        message: "Subscribed successfully", 
        data: subscribe 
    };
};