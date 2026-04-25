import express from "express";
import { learningContent } from "../data/learningContent.js";

const router = express.Router();

router.get("/learning-content", (req, res) => {
  res.json(learningContent);
});

router.get("/subjects/:subjectId", (req, res) => {
  const subject = learningContent.subjects.find(
    (item) => item.id === req.params.subjectId,
  );

  if (!subject) {
    return res.status(404).json({
      error: "Subject not found",
    });
  }

  res.json(subject);
});

export default router;