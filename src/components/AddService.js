import { useState } from "react";
import { supabase } from "../supabase";

function AddService({ onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    duration: "",
    price: "",
    image: "",
    gallery_images: "",
    service_type: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const saveService = async () => {
    const payload = {
      title: formData.title,
      duration: formData.duration,
      price: formData.price,
      image: formData.image,
      service_type: formData.service_type,
      description: formData.description,
      gallery_images: formData.gallery_images
        ? formData.gallery_images.split(",").map((img) => img.trim())
        : [],
    };

    const { error } = await supabase.from("services").insert([payload]);

    if (error) {
      alert("Error adding service");
      console.error(error);
    } else {
      alert("Service added successfully");
      onSuccess(); // refresh services list
    }
  };

  return (
    <div className="auth-page services-add-page">
      <div className="auth-card">
        <h2 className="auth-title">Add Service</h2>

        <input
          className="auth-input"
          name="title"
          placeholder="Service Title"
          onChange={handleChange}
        />

        <input
          className="auth-input"
          name="duration"
          placeholder="Duration (e.g. 1 hr)"
          onChange={handleChange}
        />

        <input
          className="auth-input"
          name="price"
          placeholder="Price (₹)"
          onChange={handleChange}
        />

        <input
          className="auth-input"
          name="image"
          placeholder="Main Image URL"
          onChange={handleChange}
        />

        <input
          className="auth-input"
          name="gallery_images"
          placeholder="Gallery Image URLs (comma separated)"
          onChange={handleChange}
        />

        <input
          className="auth-input"
          name="service_type"
          placeholder="Service Type (KITCHEN / HOUSE / BATHROOM)"
          onChange={handleChange}
        />

        <input
          className="auth-input"
          name="description"
          placeholder="Service Description"
          onChange={handleChange}
        />

        <button className="auth-button" onClick={saveService}>
          Save
        </button>
      </div>
    </div>
  );
}

export default AddService;