import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import Services from "./Services";
import Bookings from "./Bookings";
import neatifyLogo from "../neatifylogo.png";

function Dashboard() {
  const [activeTab, setActiveTab] = useState("services");
  const [serviceType, setServiceType] = useState("ALL");
  const [showMenu, setShowMenu] = useState(false);

  const navigate = useNavigate();

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleProfile = () => {
    navigate("/profile");
    setShowMenu(false);
  };

  return (
    <div className="dashboard">
      {/* ===== TOP HEADER ===== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <div />

        {/* CENTER LOGO + TITLE */}
        <div style={{ textAlign: "center" }}>
          <img
            src={neatifyLogo}
            alt="Neatify Logo"
            style={{ width: "200px", marginBottom: "4px" }}
          />
          <p style={{ fontSize: "18px", fontWeight: 600 }}>
            ADMIN DASHBOARD
          </p>
        </div>

        {/* RIGHT ACCOUNT MENU */}
        <div style={{ textAlign: "right", position: "relative" }}>
          <button
            className="allot-btn"
            onClick={() => setShowMenu(!showMenu)}
          >
            👤
          </button>

          {showMenu && (
            <div className="account-dropdown">
              <div onClick={handleProfile}>Profile</div>
              <div onClick={handleLogout}>Logout</div>
            </div>
          )}
        </div>
      </div>

      {/* ===== MAIN TABS ===== */}
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

      {/* ===== TAB CONTENT ===== */}
      {activeTab === "services" && (
        <Services
          selectedType={serviceType}
          onTypeChange={setServiceType}
        />
      )}

      {activeTab === "bookings" && <Bookings />}
    </div>
  );
}

export default Dashboard;
