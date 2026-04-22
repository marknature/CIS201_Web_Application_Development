const { fetchAssets } = require("../services/assetService");
const { ok } = require("../utils/apiResponse");

const getAssets = async (req, res, next) => {
  try {
    const assets = await fetchAssets();
    return ok(res, "Assets fetched", assets);
  } catch (error) {
    return next(error);
  }
};

module.exports = { getAssets };
