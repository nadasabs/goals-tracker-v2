const express = require("express");
const Goal = require("../models/Goal");
const authentication = require("../middlewares/authentication");
const checkPasswordReset = require("../middlewares/checkPasswordReset");

const router = express.Router();

// CREATE goal
router.post("/", authentication, checkPasswordReset, async (req, res, next) => {
  try {
    const { title, description, targetDate, status, progress } = req.body || {};

    if (!title || !targetDate) {
      return res.status(400).json({ message: "Title and targetDate are required" });
    }

    const goal = await Goal.create({
      userId: req.user.id,
      title,
      description,
      targetDate,
      status,
      progress,
    });

    res.status(201).json(goal);
  } catch (err) {
    next(err);
  }
});

// READ all goals
router.get("/", authentication, async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    next(err);
  }
});

// READ one goal
router.get("/:id", authentication, async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user.id });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.json(goal);
  } catch (err) {
    next(err);
  }
});

// UPDATE goal
router.put("/:id", authentication, checkPasswordReset, async (req, res, next) => {
  try {
    const { title, description, targetDate, status, progress } = req.body || {};

    if (!title || !targetDate) {
      return res.status(400).json({ message: "Title and targetDate are required" });
    }

    const updated = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { title, description, targetDate, status, progress },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE goal
router.delete("/:id", authentication, checkPasswordReset, async (req, res, next) => {
  try {
    const deleted = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.json({ message: "Goal deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;