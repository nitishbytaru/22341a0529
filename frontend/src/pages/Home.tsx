import { useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000";

export default function Home() {
  const [urls, setUrls] = useState([{ url: "", validity: "", shortcode: "" }]);
  const [results, setResults] = useState([]);

  const addUrl = () => {
    if (urls.length < 5) {
      setUrls([...urls, { url: "", validity: "", shortcode: "" }]);
    }
  };

  const handleChange = (index, field, value) => {
    const newUrls = [...urls];
    newUrls[index][field] = value;
    setUrls(newUrls);
  };

  const checkUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = async () => {
    for (let i = 0; i < urls.length; i++) {
      const u = urls[i];
      if (!u.url || !checkUrl(u.url)) {
        alert("Please enter valid URL in all fields");
        return;
      }
      if (u.validity && isNaN(Number(u.validity))) {
        alert("Validity must be a number");
        return;
      }
    }

    const responseList = [];
    for (let i = 0; i < urls.length; i++) {
      const u = urls[i];
      try {
        const res = await axios.post(API_BASE + "/shorturls", {
          url: u.url,
          validity: u.validity ? Number(u.validity) : undefined,
          shortcode: u.shortcode ? u.shortcode : undefined,
        });

        responseList.push(res.data);

        let history = localStorage.getItem("shortenedHistory");
        if (!history) history = "[]";
        let parsedHistory = [];
        try {
          parsedHistory = JSON.parse(history);
        } catch (e) {
          console.log("Error parsing history", e);
        }
        parsedHistory.push(res.data);
        localStorage.setItem("shortenedHistory", JSON.stringify(parsedHistory));
      } catch (e) {
        console.log("Error creating short URL", e);
      }
    }

    setResults(responseList);
  };

  return (
    <div style={{ width: "800px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center" }}>URL Shortener</h2>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        {urls.map((u, idx) => (
          <div
            key={idx}
            style={{ display: "flex", gap: "10px", marginBottom: "10px" }}
          >
            <input
              type="text"
              placeholder="URL"
              value={u.url}
              onChange={(e) => handleChange(idx, "url", e.target.value)}
              style={{ flex: 2, padding: "5px" }}
            />
            <input
              type="text"
              placeholder="Validity (mins)"
              value={u.validity}
              onChange={(e) => handleChange(idx, "validity", e.target.value)}
              style={{ flex: 1, padding: "5px" }}
            />
            <input
              type="text"
              placeholder="Shortcode"
              value={u.shortcode}
              onChange={(e) => handleChange(idx, "shortcode", e.target.value)}
              style={{ flex: 1, padding: "5px" }}
            />
          </div>
        ))}

        <div style={{ textAlign: "center", marginTop: "10px" }}>
          <button
            onClick={addUrl}
            disabled={urls.length >= 5}
            style={{ marginRight: "10px" }}
          >
            + Add URL
          </button>
          <button onClick={handleSubmit}>Shorten</button>
        </div>
      </div>

      {results.length > 0 && (
        <div>
          <h3 style={{ textAlign: "center" }}>Shortened URLs</h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {results.map((r, idx) => (
              <div
                key={idx}
                style={{
                  border: "1px solid #ccc",
                  padding: "10px",
                  wordBreak: "break-all",
                }}
              >
                <div>
                  Short URL:{" "}
                  <a href={r.shortlink} target="_blank" rel="noreferrer">
                    {r.shortlink}
                  </a>
                </div>
                <div>Expires: {new Date(r.expiry).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
