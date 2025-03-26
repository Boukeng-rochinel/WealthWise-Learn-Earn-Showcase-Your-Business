import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

export default function ChatModal() {
  const [messages, setMessages] = useState([
    { role: "system", content: "Hello! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(false); // State to track loading

  // Handle the input change (No automatic sending here)
  const handleChange = (e) => {
    setInput(e.target.value);
  };

  // Send message on button click
  const handleSendClick = async () => {
    if (!input.trim()) return; // Don't send empty messages

    const userMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput(""); // Clear input
    setLoading(true); // Show loading state

    let retries = 0;
    const maxRetries = 5;
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    while (retries < maxRetries) {
      try {
        const response = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-3.5-turbo",
            messages: updatedMessages,
          },
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
            },
          }
        );

        const botMessage = response.data.choices[0].message;
        setMessages([...updatedMessages, botMessage]);
        setLoading(false); // Hide loading once we receive the response
        return; // Exit the function once the message is sent successfully
      } catch (error) {
        if (error.response && error.response.status === 429) {
          retries++;
          const waitTime = Math.pow(2, retries) * 1000; // Exponential backoff
          console.log(`Rate limit exceeded. Retrying in ${waitTime / 1000} seconds...`);

          // If max retries reached, stop retrying
          if (retries >= maxRetries) {
            setLoading(false); // Hide loading if retries exhausted
            alert("Rate limit exceeded. Please try again later.");
            return;
          }

          await delay(waitTime);
        } else {
          console.error("Error fetching response:", error);
          setLoading(false); // Stop loading if error occurs
          alert("There was an error with the request. Please try again later.");
          return;
        }
      }
    }

    setLoading(false); // Stop loading after max retries
    alert("Rate limit exceeded. Please try again later.");
  };

  return (
    <div
      className={`modal ${isOpen ? "show" : ""} d-block`}
      tabIndex="-1"
      style={{ background: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Chat with AI</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => setIsOpen(false)}
            ></button>
          </div>
          <div className="modal-body">
            <div
              className="mb-3 p-2 border rounded overflow-auto"
              style={{ height: "250px" }}
            >
              {messages.slice(1).map((msg, i) => (
                <p
                  key={i}
                  className={msg.role === "user" ? "text-primary" : "text-dark"}
                >
                  <strong>{msg.role === "user" ? "You" : "AI"}:</strong> {msg.content}
                </p>
              ))}
              {loading && (
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}
            </div>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                value={input}
                onChange={handleChange}
                placeholder="Type a message..."
              />
              <button className="btn btn-primary" onClick={handleSendClick}>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
