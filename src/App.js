import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import Services from "./components/Services";
import EditServices from "./components/EditServices";

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Admin Dashboard */}
        <Route path="/services" element={<Services />} />

        {/* Edit Service */}
        <Route path="/edit-service/:id" element={<EditServices />} />
      </Routes>
    </Router>
  );
}

export default App;
