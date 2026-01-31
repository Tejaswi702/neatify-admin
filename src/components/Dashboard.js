import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import Services from "./Services";
import Bookings from "./Bookings";

import neatifyLogo from "../neatifylogo.png";

function Dashboard() {
  const [activeTab, setActiveTab] = useState("services");
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="dashboard">

      {/* ===== TOP HEADER ===== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          marginBottom: "12px", // ⬅️ reduced
        }}
      >
        <div />

        {/* CENTER LOGO + TITLE */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px", // ⬅️ reduced gap
            }}
          >
           <img
  src={neatifyLogo}
  alt="Neatify Logo"
  style={{
    width: "200px",
    height: "auto",
    display: "block",
    margin: "0 auto 4px auto"
  }}
/>


          </div>

          <p
            style={{
              marginTop: "4px", // ⬅️ reduced
              marginBottom: "0",
              fontSize: "18px",
              fontWeight: 600,
            }}
          >
            ADMIN DASHBOARD
          </p>
        </div>

        {/* LOGOUT RIGHT */}
        <div style={{ textAlign: "right" }}>
          <button className="allot-btn" onClick={handleLogout} title="Logout">
            ⏻
          </button>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="dashboard-tabs" style={{ justifyContent: "center" }}>
        <button
          className={activeTab === "services" ? "active" : ""}
          onClick={() => setActiveTab("services")}
        >
          Services
        </button>

        <button
          className={activeTab === "bookings" ? "active" : ""}
          onClick={() => setActiveTab("bookings")}
        >
          Bookings
        </button>
      </div>

      {/* ===== CONTENT ===== */}
      {activeTab === "services" && <Services />}
      {activeTab === "bookings" && <Bookings />}
    </div>
  );
}

export default Dashboard;