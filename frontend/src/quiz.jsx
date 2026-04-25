import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5137";

function Quiz() {
  const [topic, setTopic] = useState("");
  const [quiz, setQuiz] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateQuiz = async () => {
    if (!topic.trim() || isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/generate-quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic }),
      });

      const data = await response.json();
      setQuiz(data.quiz || data.error || "Error generating quiz");
    } catch {
      setQuiz("Error generating quiz");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Generate Quiz</h2>

      <input
        onChange={(event) => setTopic(event.target.value)}
        placeholder="Enter topic"
        type="text"
        value={topic}
      />

      <button disabled={isLoading} onClick={generateQuiz} type="button">
        {isLoading ? "Generating" : "Generate"}
      </button>

      <pre>{quiz}</pre>
    </div>
  );
}

export default Quiz;
