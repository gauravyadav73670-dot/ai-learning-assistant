export const learningContent = {
  brand: {
    eyebrow: "Learning Assistant",
    title: "Study Desk",
    welcome:
      "Welcome back. Pick a subject, then ask for a lesson, quiz, example, or study plan. I will keep the answer focused on your current goal.",
  },
  subjects: [
    {
      id: "python",
      name: "Python Basics",
      level: "Beginner",
      goal: "Build small programs with confidence",
      focus: ["variables", "loops", "functions"],
      time: "20 min",
      lessonTitle: "Learn the pattern, trace it once, then write it yourself.",
      checkpoints: [
        "Review how values are stored in variables",
        "Trace a loop with three sample inputs",
        "Write one function that returns a result",
        "Explain the program in two sentences",
      ],
      resources: [
        { label: "Concept notes", value: "6 min read" },
        { label: "Practice set", value: "8 questions" },
        { label: "Mini project", value: "Build a score tracker" },
      ],
      quizTopics: ["variables", "for loops", "functions"],
      review:
        "Rebuild yesterday's loop without looking, then compare it with your notes.",
      progress: {
        percent: 72,
        completed: "3 sessions finished this week",
      },
    },
    {
      id: "web",
      name: "Web Development",
      level: "Starter",
      goal: "Ship a clean React page",
      focus: ["components", "state", "responsive UI"],
      time: "25 min",
      lessonTitle: "Turn one screen into small parts that update predictably.",
      checkpoints: [
        "Split the page into reusable components",
        "Connect state to a button or input",
        "Check the layout at mobile and desktop sizes",
        "Run a production build before sharing",
      ],
      resources: [
        { label: "Component guide", value: "7 min read" },
        { label: "State drills", value: "6 tasks" },
        { label: "Mini project", value: "Build a profile card" },
      ],
      quizTopics: ["React components", "state", "responsive layout"],
      review:
        "Open an old component and rename its props so the data flow is obvious.",
      progress: {
        percent: 64,
        completed: "2 sessions finished this week",
      },
    },
    {
      id: "data",
      name: "Data Skills",
      level: "Foundation",
      goal: "Read charts and explain trends",
      focus: ["tables", "charts", "insights"],
      time: "18 min",
      lessonTitle: "Move from raw numbers to one clear observation.",
      checkpoints: [
        "Scan the table for the largest and smallest values",
        "Choose the chart that fits the comparison",
        "Write one trend statement with evidence",
        "Name one question the data cannot answer yet",
      ],
      resources: [
        { label: "Chart notes", value: "5 min read" },
        { label: "Practice table", value: "10 rows" },
        { label: "Mini project", value: "Explain a trend" },
      ],
      quizTopics: ["tables", "bar charts", "data insights"],
      review:
        "Take one chart and write the headline a teacher would expect to see.",
      progress: {
        percent: 58,
        completed: "2 sessions finished this week",
      },
    },
  ],
};
