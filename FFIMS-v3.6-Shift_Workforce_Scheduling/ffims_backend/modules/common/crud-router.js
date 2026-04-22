const express = require("express");
const mongoose = require("mongoose");
const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/api-response");
const ApiError = require("../../utils/apiError");
const { authenticateToken } = require("../../middleware/auth.middleware");

const RESERVED_QUERY_KEYS = new Set(["page", "pageSize", "sortBy", "sortOrder"]);

const normalizeValue = (value) => {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  if (value !== "" && !Number.isNaN(Number(value))) return Number(value);
  if (mongoose.Types.ObjectId.isValid(value)) return value;
  return value;
};

const normalizeDocument = (document) => {
  const plain = document.toObject ? document.toObject() : document;
  return {
    id: plain._id,
    ...plain,
    _id: undefined,
    __v: undefined,
  };
};

const requireRoles =
  (roles = []) =>
  (req, res, next) => {
    if (!roles.length || roles.includes(req.user?.role)) {
      return next();
    }

    return next(new ApiError(403, "You do not have permission to perform this action."));
  };

const buildCrudRouter = ({
  Model,
  resourceName,
  writeRoles = ["Admin"],
  listFilter,
  createDefaults,
  updateGuard,
  populate = "",
  defaultSort = "createdAt",
}) => {
  const router = express.Router();

  router.use(authenticateToken);

  router.get(
    "/",
    asyncHandler(async (req, res) => {
      const page = Math.max(Number(req.query.page) || 1, 1);
      const pageSize = Math.min(Math.max(Number(req.query.pageSize) || 20, 1), 100);
      const sortBy = req.query.sortBy || defaultSort;
      const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
      const query = {};

      for (const [key, value] of Object.entries(req.query)) {
        if (!RESERVED_QUERY_KEYS.has(key)) {
          query[key] = normalizeValue(value);
        }
      }

      const finalQuery = listFilter ? await listFilter(query, req) : query;
      const listQuery = Model.find(finalQuery)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * pageSize)
        .limit(pageSize);

      if (populate) {
        listQuery.populate(populate);
      }

      const [items, total] = await Promise.all([
        listQuery,
        Model.countDocuments(finalQuery),
      ]);

      sendSuccess(res, {
        message: `${resourceName} retrieved successfully.`,
        data: items.map(normalizeDocument),
        meta: { page, pageSize, total },
      });
    })
  );

  router.get(
    "/:id",
    asyncHandler(async (req, res) => {
      let query = Model.findById(req.params.id);
      if (populate) {
        query = query.populate(populate);
      }

      const item = await query;
      if (!item) {
        throw new ApiError(404, `${resourceName.slice(0, -1)} not found.`);
      }

      sendSuccess(res, {
        message: `${resourceName.slice(0, -1)} retrieved successfully.`,
        data: normalizeDocument(item),
      });
    })
  );

  router.post(
    "/",
    requireRoles(writeRoles),
    asyncHandler(async (req, res) => {
      const defaults = createDefaults ? await createDefaults(req) : {};
      const item = await Model.create({
        ...req.body,
        ...defaults,
      });

      sendSuccess(res, {
        statusCode: 201,
        message: `${resourceName.slice(0, -1)} created successfully.`,
        data: normalizeDocument(item),
      });
    })
  );

  router.patch(
    "/:id",
    requireRoles(writeRoles),
    asyncHandler(async (req, res) => {
      const existing = await Model.findById(req.params.id);
      if (!existing) {
        throw new ApiError(404, `${resourceName.slice(0, -1)} not found.`);
      }

      if (updateGuard) {
        await updateGuard(existing, req);
      }

      Object.assign(existing, req.body);
      await existing.save();

      sendSuccess(res, {
        message: `${resourceName.slice(0, -1)} updated successfully.`,
        data: normalizeDocument(existing),
      });
    })
  );

  router.delete(
    "/:id",
    requireRoles(writeRoles),
    asyncHandler(async (req, res) => {
      const existing = await Model.findById(req.params.id);
      if (!existing) {
        throw new ApiError(404, `${resourceName.slice(0, -1)} not found.`);
      }

      await Model.deleteOne({ _id: req.params.id });

      sendSuccess(res, {
        message: `${resourceName.slice(0, -1)} deleted successfully.`,
        data: null,
      });
    })
  );

  return router;
};

module.exports = { buildCrudRouter, requireRoles, normalizeDocument };
