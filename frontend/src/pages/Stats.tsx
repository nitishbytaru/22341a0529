import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000";

export default function Stats() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    let history = localStorage.getItem("shortenedHistory");
    if (!history) history = "[]";

    let parsedHistory = [];
    try {
      parsedHistory = JSON.parse(history);
    } catch (e) {
      console.log("Error parsing history", e);
    }

    const fetchAllStats = async () => {
      const result = [];

      for (let i = 0; i < parsedHistory.length; i++) {
        const shortlink = parsedHistory[i].shortlink;
        const parts = shortlink.split("/");
        const code = parts[parts.length - 1];
        if (!code) continue;

        try {
          const res = await axios.get(API_BASE + "/shorturls/" + code);
          const data = res.data;

          result.push({
            shortlink: shortlink,
            expiry: parsedHistory[i].expiry,
            shortcode: data.shortcode,
            originalUrl: data.originalUrl,
            createdAt: data.createdAt,
            totalClicks: data.totalClicks,
          });
        } catch (e) {
          console.log("Error fetching stats for " + code, e);
        }
      }

      setStats(result);
    };

    fetchAllStats();
  }, []);

  return (
    <div style={{ width: "800px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center" }}>URL Statistics</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {stats.map((s, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              wordBreak: "break-all",
            }}
          >
            <div>
              Short URL:{" "}
              <a href={s.shortlink} target="_blank" rel="noreferrer">
                {s.shortlink}
              </a>
            </div>
            <div>Original URL: {s.originalUrl}</div>
            <div>Created: {new Date(s.createdAt).toLocaleString()}</div>
            <div>Expiry: {new Date(s.expiry).toLocaleString()}</div>
            <div>Total Clicks: {s.totalClicks}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
