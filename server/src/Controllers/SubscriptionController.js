const TryCatch = require("../Middlewares/TryCatch");
const { subscribeNewsletter } = require("../Models/SubscriptionModel");
const { newsletterSubscriptionSchema, formateZodError } = require("../Utils/Zod");


exports.subNewsletter = TryCatch(async (req, res) => {
    const validation = newsletterSubscriptionSchema.safeParse(req.body);
    if (!validation.success) {
    const { firstError, allErrors } = formateZodError(validation.error);
    return res.status(400).json({
      success: false,
      message: firstError,
      errors: allErrors,
    });
  }

  const {email} = validation.data;
  const { success, message, data } = await subscribeNewsletter(email);
  if (!success) {
    return res.status(400).json({ success, message });
  }
  return res.status(200).json({ success, message });
});