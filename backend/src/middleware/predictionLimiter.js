const userRequests = new Map();

export const predictionLimiter = (req, res, next) => {
  const userId = req.user.id;

  const limit = 100; // max predictions
  const windowTime = 24 * 60 * 60 * 1000; // 24 hours

  if (!userRequests.has(userId)) {
    userRequests.set(userId, []);
  }

  const timestamps = userRequests.get(userId);
  const now = Date.now();

  // remove old requests
  const filtered = timestamps.filter(
    (time) => now - time < windowTime
  );

  filtered.push(now);
  userRequests.set(userId, filtered);

  if (filtered.length > limit) {
    return res.status(429).json({
      success: false,
      message: "Prediction limit exceeded (100/day)",
    });
  }

  next();
};