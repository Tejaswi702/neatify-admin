import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

function EditServices() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    duration: "",
    price: "",
    image: "",
  });

  useEffect(() => {
    const fetchService = async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        setFormData({
          title: data.title || "",
          category: data.category || "",
          duration: data.duration || "",
          price: data.price || "",
          image: data.image || "",
        });
      }
    };

    fetchService();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const updateService = async () => {
    const { error } = await supabase
      .from("services")
      .update(formData)
      .eq("id", id);

    if (!error) {
      navigate("/dashboard"); // ✅ go back to dashboard after update
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Edit Service</h2>

        <input
          className="auth-input"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Service Title"
        />

        <input
          className="auth-input"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="Category"
        />

        <input
          className="auth-input"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          placeholder="Duration"
        />

        <input
          className="auth-input"
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="Price"
        />

        <input
          className="auth-input"
          name="image"
          value={formData.image}
          onChange={handleChange}
          placeholder="Image URL"
        />

        {/* Update Button */}
        <button className="auth-button" onClick={updateService}>
          Update Service
        </button>

        {/* ✅ Back Button (same style) */}
        <button
          className="auth-button back-btn"
          onClick={() => navigate("/dashboard")}
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default EditServices;
