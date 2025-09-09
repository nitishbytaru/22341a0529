import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Stats from "./pages/Stats";

function App() {
  return (
    <Router>
      <div>
        <nav
          style={{
            backgroundColor: "black",
            padding: "10px",
            textAlign: "center",
          }}
        >
          <Link
            to="/"
            style={{ color: "white", margin: "0 10px", textDecoration: "none" }}
          >
            Home
          </Link>
          <Link
            to="/stats"
            style={{ color: "white", margin: "0 10px", textDecoration: "none" }}
          >
            Stats
          </Link>
        </nav>

        <div
          style={{ display: "flex", justifyContent: "center", padding: "20px" }}
        >
          <div style={{ width: "100%", maxWidth: "800px" }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/stats" element={<Stats />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
