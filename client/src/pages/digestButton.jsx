// components/DigestButton.jsx
import { useState } from "react";
import api from "../api"; // your existing axios instance with auth token

export default function DigestButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const sendDigest = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await api.get("/api/digest/test");
      setMessage(`Digest sent to ${res.data.sentTo}`);
    } catch (err) {
      setMessage("Failed to send digest");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={sendDigest} disabled={loading}>
        {loading ? "Sending..." : "Send My Weekly Digest"}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}