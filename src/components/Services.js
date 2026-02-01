import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import AddService from "./AddService";

function Services({ selectedType, onTypeChange }) {
  const [services, setServices] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [activeTab, setActiveTab] = useState("list");

  const navigate = useNavigate();

  // ✅ Memoized function (fixes ESLint warning)
  const fetchServices = useCallback(async () => {
    let query = supabase.from("services").select("*");

    if (selectedType !== "ALL") {
      query = query.eq("service_type", selectedType);
    }

    const { data } = await query;
    setServices(data || []);
  }, [selectedType]);

  const fetchServiceTypes = async () => {
    const { data } = await supabase
      .from("services")
      .select("service_type");

    const unique = [
      "ALL",
      ...new Set((data || []).map((d) => d.service_type)),
    ];

    setServiceTypes(unique);
  };

  useEffect(() => {
    fetchServices();
  }, [fetchServices]); // ✅ warning fixed

  useEffect(() => {
    fetchServiceTypes();
  }, []);

  const deleteService = async (id) => {
    if (!window.confirm("Delete this service?")) return;
    await supabase.from("services").delete().eq("id", id);
    fetchServices();
  };

  return (
    <div>
      <h2>Services</h2>

      <div className="dashboard-tabs services-header-row">
        <div>
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
          <select
            className="service-filter"
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
          >
            {serviceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        )}
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

              <div className="service-card-actions">
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
        <AddService onSuccess={() => setActiveTab("list")} />
      )}
    </div>
  );
}

export default Services;
