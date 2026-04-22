const analyticsService = require("./analytics.service");
const asyncHandler = require("../../utils/asyncHandler");

const getFaultAnalytics = asyncHandler(async (req, res) => {
  const stats = await analyticsService.getFaultAnalytics();
  res.status(200).json({
    status: "success",
    data: stats
  });
});

module.exports = {
  getFaultAnalytics
};
