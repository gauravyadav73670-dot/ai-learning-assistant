import express from "express";
import OpenAI from "openai";

const router = express.Router();

const fallbackQuizzes = {
  python: [
    {
      question: "What is the main purpose of a variable in Python?",
      options: ["To store a value", "To delete code", "To start the server", "To style text"],
      answer: "A",
    },
    {
      question: "Which loop is best when you want to repeat over each item in a list?",
      options: ["if loop", "for loop", "print loop", "return loop"],
      answer: "B",
    },
    {
      question: "What does a function help you do?",
      options: ["Repeat reusable logic", "Change the screen color only", "Install packages", "Close files"],
      answer: "A",
    },
    {
      question: "Which keyword sends a value back from a function?",
      options: ["send", "break", "return", "input"],
      answer: "C",
    },
    {
      question: "What should you do first when a loop behaves strangely?",
      options: ["Trace each step", "Delete the project", "Rename Python", "Ignore the output"],
      answer: "A",
    },
  ],
  web: [
    {
      question: "What is a React component?",
      options: ["A reusable piece of UI", "A database table", "A server password", "A browser setting"],
      answer: "A",
    },
    {
      question: "What does state help a component remember?",
      options: ["Changing values", "Only CSS colors", "The computer brand", "Hidden files"],
      answer: "A",
    },
    {
      question: "Why should a layout be responsive?",
      options: ["So it works on different screen sizes", "So it never loads", "So text disappears", "So buttons cannot be clicked"],
      answer: "A",
    },
    {
      question: "Which file usually mounts a Vite React app?",
      options: ["main.jsx", "photo.png", "notes.txt", "server.log"],
      answer: "A",
    },
    {
      question: "What is a good final check before sharing a frontend project?",
      options: ["Run a production build", "Remove all styles", "Close the browser forever", "Rename every button"],
      answer: "A",
    },
  ],
  data: [
    {
      question: "What should you look for first in a small table?",
      options: ["Largest and smallest values", "Only the title font", "The file icon", "Random rows"],
      answer: "A",
    },
    {
      question: "Which chart is often good for comparing categories?",
      options: ["Bar chart", "Password chart", "Folder chart", "Syntax chart"],
      answer: "A",
    },
    {
      question: "What makes an insight useful?",
      options: ["It includes evidence", "It hides the data", "It avoids numbers", "It changes every word"],
      answer: "A",
    },
    {
      question: "What should you say when data cannot answer a question?",
      options: ["Name the limitation", "Invent a number", "Delete the chart", "Avoid the topic"],
      answer: "A",
    },
    {
      question: "What is a trend?",
      options: ["A pattern over values or time", "A single button", "A code editor", "A broken image"],
      answer: "A",
    },
  ],
};

const getOpenAIClient = () =>
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

let useLiveQuizGeneration = true;

const chooseFallbackQuiz = (topic = "") => {
  const normalizedTopic = topic.toLowerCase();

  if (normalizedTopic.includes("web") || normalizedTopic.includes("react")) {
    return fallbackQuizzes.web;
  }

  if (normalizedTopic.includes("data") || normalizedTopic.includes("chart")) {
    return fallbackQuizzes.data;
  }

  return fallbackQuizzes.python;
};

const formatQuiz = (topic, questions) => {
  const answerKey = questions
    .map((item, index) => `${index + 1}. ${item.answer}`)
    .join("\n");

  const body = questions
    .map(
      (item, index) => `${index + 1}. ${item.question}
A. ${item.options[0]}
B. ${item.options[1]}
C. ${item.options[2]}
D. ${item.options[3]}`,
    )
    .join("\n\n");

  return `Quiz: ${topic}

${body}

Answers:
${answerKey}`;
};

const sendFallbackQuiz = (res, topic, notice) => {
  const questions = chooseFallbackQuiz(topic);

  return res.json({
    quiz: formatQuiz(topic, questions),
    source: "backend",
    notice,
  });
};

router.post("/generate-quiz", async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({
      error: "Topic is required",
    });
  }

  const prompt = `Create a quiz on ${topic}.
Include:
- 5 multiple choice questions
- Each question should have 4 options
- Provide correct answers at the end`;

  if (!process.env.OPENAI_API_KEY || !useLiveQuizGeneration) {
    return sendFallbackQuiz(
      res,
      topic,
      "This quiz came from the backend practice bank.",
    );
  }

  try {
    const response = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI tutor who writes clear student quizzes.",
        },
        { role: "user", content: prompt },
      ],
    });

    res.json({
      quiz: response.choices[0].message.content,
      source: "ai",
    });
  } catch (error) {
    console.error("Quiz AI fallback:", error.message);

    if (error.code === "insufficient_quota" || error.status === 429) {
      useLiveQuizGeneration = false;
    }

    return sendFallbackQuiz(
      res,
      topic,
      "Live AI quiz generation is not available right now, so this quiz came from the backend practice bank.",
    );
  }
});

export default router;
