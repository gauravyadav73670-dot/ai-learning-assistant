import { useEffect, useMemo, useState } from "react";
import heroArt from "./assets/hero.png";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5137";

const fallbackContent = {
  brand: {
    eyebrow: "Learning Assistant",
    title: "Study Desk",
    welcome:
      "Welcome back. Pick a subject, then ask for a lesson, quiz, example, or study plan.",
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
  ],
};

const emptyQuizResult = {
  topic: "",
  text: "Choose a topic to generate a five-question quiz.",
  notice: "",
  source: "idle",
};

const emptyAuthForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const getSavedUser = () => {
  try {
    const savedUser = localStorage.getItem("ai-learning-user");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
};

function App() {
  const [currentUser, setCurrentUser] = useState(getSavedUser);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState(emptyAuthForm);
  const [authMessage, setAuthMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [content, setContent] = useState(fallbackContent);
  const [contentStatus, setContentStatus] = useState("Loading");
  const [activeSubjectId, setActiveSubjectId] = useState(
    fallbackContent.subjects[0].id,
  );
  const [messages, setMessages] = useState([
    { role: "ai", text: fallbackContent.brand.welcome },
  ]);
  const [input, setInput] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [quizResult, setQuizResult] = useState(emptyQuizResult);
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch(`${API_URL}/api/learning-content`);

        if (!response.ok) {
          throw new Error("Content server returned an error");
        }

        const data = await response.json();
        setContent(data);
        setActiveSubjectId(data.subjects[0]?.id || fallbackContent.subjects[0].id);
        setMessages((current) =>
          current.length === 1 && current[0].text === fallbackContent.brand.welcome
            ? [{ role: "ai", text: data.brand.welcome }]
            : current,
        );
        setContentStatus("Backend");
      } catch {
        setContentStatus("Local");
      }
    };

    loadContent();
  }, []);

  const activeSubject = useMemo(
    () =>
      content.subjects.find((subject) => subject.id === activeSubjectId) ||
      content.subjects[0],
    [activeSubjectId, content.subjects],
  );

  const quickPrompts = [
    `Teach me ${activeSubject.focus[0]} in simple steps`,
    `Give me a quiz on ${activeSubject.focus[1]}`,
    `Make a ${activeSubject.time} study plan`,
  ];

  const isBusy = isSending || isGeneratingQuiz;

  const sendMessage = async (messageText = input) => {
    const trimmed = messageText.trim();
    if (!trimmed || isBusy) return;

    setMessages((current) => [...current, { role: "user", text: trimmed }]);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Subject: ${activeSubject.name}. Goal: ${activeSubject.goal}. Student request: ${trimmed}`,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok && !data.reply) {
        throw new Error("Tutor server returned an error");
      }

      setMessages((current) => [
        ...current,
        { role: "ai", text: data.reply || "I am ready. Ask me for the next step." },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "ai",
          text:
            "I could not reach the live tutor yet. Start with one focus area, write one example, explain it out loud, then test yourself with three short questions.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const generateQuiz = async (topic = customTopic) => {
    const cleanTopic = topic.trim() || activeSubject.quizTopics[0] || activeSubject.name;
    if (isBusy || !cleanTopic) return;

    const fullTopic = `${activeSubject.name}: ${cleanTopic}`;
    setIsGeneratingQuiz(true);
    setQuizResult({
      topic: fullTopic,
      text: "Generating quiz...",
      notice: "",
      source: "loading",
    });

    try {
      const response = await fetch(`${API_URL}/api/generate-quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic: fullTopic }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Quiz server returned an error");
      }

      setQuizResult({
        topic: fullTopic,
        text: data.quiz || "I could not create a quiz for that topic.",
        notice: data.notice || "",
        source: data.source || "backend",
      });
      setCustomTopic("");
    } catch (error) {
      setQuizResult({
        topic: fullTopic,
        text: error.message,
        notice: "Try another topic or restart the backend server.",
        source: "error",
      });
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  const handleQuizSubmit = (event) => {
    event.preventDefault();
    generateQuiz(customTopic);
  };

  const selectSubject = (subjectId) => {
    setActiveSubjectId(subjectId);
    setCustomTopic("");
    setQuizResult(emptyQuizResult);
  };

  const updateAuthForm = (field, value) => {
    setAuthForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const switchAuthMode = (mode) => {
    setAuthMode(mode);
    setAuthMessage("");
    setAuthForm(emptyAuthForm);
    setShowPassword(false);
  };

  const submitAuth = async (event) => {
    event.preventDefault();

    if (authMode === "register" && authForm.password !== authForm.confirmPassword) {
      setAuthMessage("Passwords do not match");
      return;
    }

    setIsAuthenticating(true);
    setAuthMessage("");

    try {
      const endpoint = authMode === "login" ? "login" : "register";
      const response = await fetch(`${API_URL}/api/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: authForm.name,
          email: authForm.email,
          password: authForm.password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      setCurrentUser(data.user);
      localStorage.setItem("ai-learning-user", JSON.stringify(data.user));
      setAuthForm(emptyAuthForm);
      setAuthMessage("");
    } catch (error) {
      setAuthMessage(error.message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("ai-learning-user");
    setMessages([{ role: "ai", text: content.brand.welcome }]);
  };

  if (!currentUser) {
    return (
      <main className="auth-shell">
        <section className="auth-card" aria-label="Account access">
          <div className="auth-visual">
            <div className="brand auth-brand">
              <span className="brand-mark">AI</span>
              <div>
                <p className="eyebrow">{content.brand.eyebrow}</p>
                <h1>{content.brand.title}</h1>
              </div>
            </div>
            <img alt="" src={heroArt} />
            <h2>Personal study progress starts with your account.</h2>
            <p>
              Save your learning profile, return to your dashboard, and generate
              quizzes from the backend practice bank.
            </p>
          </div>

          <div className="auth-panel">
            <div className="auth-tabs" aria-label="Authentication mode">
              <button
                className={authMode === "login" ? "active" : ""}
                onClick={() => switchAuthMode("login")}
                type="button"
              >
                Login
              </button>
              <button
                className={authMode === "register" ? "active" : ""}
                onClick={() => switchAuthMode("register")}
                type="button"
              >
                Register
              </button>
            </div>

            <div className="auth-heading">
              <p className="eyebrow">
                {authMode === "login" ? "Welcome back" : "Create account"}
              </p>
              <h2>{authMode === "login" ? "Login to Study Desk" : "Register for Study Desk"}</h2>
            </div>

            <form className="auth-form" onSubmit={submitAuth}>
              {authMode === "register" ? (
                <label>
                  <span>Name</span>
                  <input
                    autoComplete="name"
                    onChange={(event) => updateAuthForm("name", event.target.value)}
                    placeholder="Your name"
                    type="text"
                    value={authForm.name}
                  />
                </label>
              ) : null}

              <label>
                <span>Email</span>
                <input
                  autoComplete="email"
                  onChange={(event) => updateAuthForm("email", event.target.value)}
                  placeholder="you@example.com"
                  type="email"
                  value={authForm.email}
                />
              </label>

              <label>
                <span>Password</span>
                <div className="password-field">
                  <input
                    autoComplete={authMode === "login" ? "current-password" : "new-password"}
                    onChange={(event) => updateAuthForm("password", event.target.value)}
                    placeholder="Enter password"
                    type={showPassword ? "text" : "password"}
                    value={authForm.password}
                  />
                  <button onClick={() => setShowPassword((current) => !current)} type="button">
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>

              {authMode === "register" ? (
                <label>
                  <span>Confirm password</span>
                  <input
                    autoComplete="new-password"
                    onChange={(event) =>
                      updateAuthForm("confirmPassword", event.target.value)
                    }
                    placeholder="Repeat password"
                    type={showPassword ? "text" : "password"}
                    value={authForm.confirmPassword}
                  />
                </label>
              ) : null}

              {authMessage ? <p className="auth-message">{authMessage}</p> : null}

              <button className="auth-submit" disabled={isAuthenticating} type="submit">
                {isAuthenticating
                  ? "Please wait"
                  : authMode === "login"
                    ? "Login"
                    : "Create account"}
              </button>
            </form>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Learning navigation">
        <div className="brand">
          <span className="brand-mark">AI</span>
          <div>
            <p className="eyebrow">{content.brand.eyebrow}</p>
            <h1>{content.brand.title}</h1>
          </div>
        </div>

        <nav className="subject-list" aria-label="Subjects">
          {content.subjects.map((subject) => (
            <button
              className={subject.id === activeSubjectId ? "subject active" : "subject"}
              key={subject.id}
              onClick={() => selectSubject(subject.id)}
              type="button"
            >
              <span>{subject.name}</span>
              <small>{subject.level}</small>
            </button>
          ))}
        </nav>

        <div className="study-card">
          <img alt="" src={heroArt} />
          <p className="eyebrow">Current goal</p>
          <strong>{activeSubject.goal}</strong>
        </div>
      </aside>

      <section className="workspace" aria-label="Learning workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Today</p>
            <h2>{activeSubject.name}</h2>
          </div>
          <div className="session-meta" aria-label="Session details">
            <span>{currentUser.name}</span>
            <span>{activeSubject.time}</span>
            <span>{activeSubject.level}</span>
            <span>{activeSubject.checkpoints.length} checkpoints</span>
            <span>{contentStatus} content</span>
            <button onClick={logout} type="button">
              Logout
            </button>
          </div>
        </header>

        <section className="learning-grid">
          <div className="lesson-stack">
            <div className="lesson-panel">
              <div className="panel-heading">
                <p className="eyebrow">Lesson path</p>
                <h3>{activeSubject.lessonTitle}</h3>
              </div>

              <div className="focus-row">
                {activeSubject.focus.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>

              <div className="checkpoint-list">
                {activeSubject.checkpoints.map((checkpoint, index) => (
                  <div className="checkpoint" key={checkpoint}>
                    <span>{index + 1}</span>
                    <p>{checkpoint}</p>
                  </div>
                ))}
              </div>

              <div className="actions">
                <button
                  disabled={isBusy}
                  onClick={() => sendMessage(quickPrompts[0])}
                  type="button"
                >
                  Start lesson
                </button>
                <button
                  disabled={isBusy}
                  onClick={() => generateQuiz(activeSubject.quizTopics[0])}
                  type="button"
                >
                  Create quiz
                </button>
              </div>
            </div>

            <div className="quiz-panel">
              <div className="quiz-heading">
                <div>
                  <p className="eyebrow">Quiz section</p>
                  <h3>Practice from backend topics</h3>
                </div>
                <span className={`quiz-source ${quizResult.source}`}>
                  {quizResult.source === "idle" ? "Ready" : quizResult.source}
                </span>
              </div>

              <div className="quiz-topics" aria-label="Quiz topics">
                {activeSubject.quizTopics.map((topic) => (
                  <button
                    disabled={isBusy}
                    key={topic}
                    onClick={() => generateQuiz(topic)}
                    type="button"
                  >
                    {topic}
                  </button>
                ))}
              </div>

              <form className="quiz-form" onSubmit={handleQuizSubmit}>
                <label className="sr-only" htmlFor="quiz-topic">
                  Quiz topic
                </label>
                <input
                  id="quiz-topic"
                  onChange={(event) => setCustomTopic(event.target.value)}
                  placeholder="Enter any quiz topic"
                  type="text"
                  value={customTopic}
                />
                <button disabled={isBusy} type="submit">
                  Generate
                </button>
              </form>

              {quizResult.notice ? <p className="quiz-notice">{quizResult.notice}</p> : null}
              <pre className="quiz-output">{quizResult.text}</pre>
            </div>
          </div>

          <div className="chat-panel">
            <div className="chat-header">
              <div>
                <p className="eyebrow">Tutor chat</p>
                <h3>Ask, practice, repeat</h3>
              </div>
              <span className={isSending ? "status busy" : "status"}>
                {isSending ? "Thinking" : "Ready"}
              </span>
            </div>

            <div className="messages" aria-live="polite">
              {messages.map((message, index) => (
                <article className={`message ${message.role}`} key={`${message.role}-${index}`}>
                  <span>{message.role === "ai" ? "Tutor" : "You"}</span>
                  <p>{message.text}</p>
                </article>
              ))}
            </div>

            <div className="prompt-row">
              {quickPrompts.map((prompt) => (
                <button
                  disabled={isBusy}
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  type="button"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form className="composer" onSubmit={handleSubmit}>
              <label className="sr-only" htmlFor="message">
                Message
              </label>
              <input
                id="message"
                onChange={(event) => setInput(event.target.value)}
                placeholder={`Ask about ${activeSubject.focus[0]}`}
                type="text"
                value={input}
              />
              <button disabled={isBusy} type="submit">
                Send
              </button>
            </form>
          </div>
        </section>
      </section>

      <aside className="right-rail" aria-label="Progress and resources">
        <section className="progress-panel">
          <p className="eyebrow">Weekly progress</p>
          <h3>{activeSubject.progress.percent}%</h3>
          <div
            aria-label={`${activeSubject.progress.percent} percent complete`}
            className="progress-track"
          >
            <span style={{ width: `${activeSubject.progress.percent}%` }} />
          </div>
          <p>{activeSubject.progress.completed}</p>
        </section>

        <section className="resource-panel">
          <p className="eyebrow">Resources</p>
          {activeSubject.resources.map((resource) => (
            <div className="resource" key={resource.label}>
              <span>{resource.label}</span>
              <strong>{resource.value}</strong>
            </div>
          ))}
        </section>

        <section className="review-panel">
          <p className="eyebrow">Next review</p>
          <h3>Tomorrow</h3>
          <p>{activeSubject.review}</p>
        </section>
      </aside>
    </main>
  );
}

export default App;
