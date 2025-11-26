const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");       // JWT
const adminOnly = require("../middlewares/adminOnly.middleware"); // Role

const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
} = require("../controllers/category.controller");

// Admin only routes
router.post("/", auth, adminOnly, createCategory);
router.patch("/:id", auth, adminOnly, updateCategory);
router.delete("/:id", auth, adminOnly, deleteCategory);

// Public (if you want)
router.get("/", getCategories);

module.exports = router;
