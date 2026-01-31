import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import AddService from "./AddService";

function Services() {
  const [services, setServices] = useState([]);
  const [activeTab, setActiveTab] = useState("list");
  const navigate = useNavigate();

  const fetchServices = async () => {
    const { data } = await supabase.from("services").select("*");
    setServices(data || []);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const deleteService = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;

    const { error } = await supabase.from("services").delete().eq("id", id);

    if (!error) {
      setServices((prev) => prev.filter((s) => s.id !== id));
    }
  };

  return (
    <div>
      <h2>Services</h2>

      <div className="dashboard-tabs">
        <button
          className={activeTab === "list" ? "active" : ""}
          onClick={() => setActiveTab("list")}
        >
          Services
        </button>

        <button
          className={activeTab === "add" ? "active" : ""}
          onClick={() => setActiveTab("add")}
        >
          Add Service
        </button>
      </div>

      {activeTab === "list" && (
        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <img src={service.image} alt={service.title} />

              <div className="service-card-content">
                <h3>{service.title}</h3>
                <p>Category: {service.category}</p>
                <p>Duration: {service.duration}</p>
                <p className="price">{service.price}</p>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  className="edit-btn"
                  onClick={() => deleteService(service.id)}
                >
                  Delete
                </button>

                <button
                  className="edit-btn"
                  onClick={() => navigate(`/edit-service/${service.id}`)}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "add" && (
        <AddService
          onSuccess={() => {
            setActiveTab("list");
            fetchServices();
          }}
        />
      )}
    </div>
  );
}

export default Services;