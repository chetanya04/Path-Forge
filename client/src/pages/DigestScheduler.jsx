// components/DigestScheduler.jsx
import { useState } from "react";
import api from "../api";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DigestScheduler() {
  const [day, setDay] = useState(1);
  const [time, setTime] = useState("08:00");
  const [message, setMessage] = useState("");

  const save = async () => {
    const [hour, minute] = time.split(":").map(Number);
    try {
      await api.patch("/api/digest/schedule", { digestDay: day, digestHour: hour, digestMinute: minute });
      setMessage("Schedule saved!");
    } catch {
      setMessage("Failed to save");
    }
  };

  return (
    <div>
      <select value={day} onChange={e => setDay(Number(e.target.value))}>
        {days.map((d, i) => <option key={i} value={i}>{d}</option>)}
      </select>
      <input type="time" value={time} onChange={e => setTime(e.target.value)} />
      <button onClick={save}>Save Schedule</button>
      {message && <p>{message}</p>}
    </div>
  );
}