import { useEffect, useState } from "react";
import { supabase } from "../supabase";

function BookingPage() {
  const [bookings, setBookings] = useState([]);
  const [staffMap, setStaffMap] = useState({});
  const [activeTab, setActiveTab] = useState("unassigned");

  // Filters
  const [selectedDate, setSelectedDate] = useState("ALL");
  const [selectedTime, setSelectedTime] = useState("ALL");

  // Staff flow
  const [showStaff, setShowStaff] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [assignmentDone, setAssignmentDone] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  // ================= FETCH BOOKINGS =================
  const fetchBookings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select(`
        id,
        customer_name,
        email,
        phone_number,
        full_address,
        booking_date,
        booking_time,
        services,
        total_amount,
        assigned_staff_email,
        payment_status,
        payment_method,
        created_at
      `)
      .order("created_at", { ascending: false });

    setBookings(data || []);

    const emails = data?.map(b => b.assigned_staff_email).filter(Boolean);
    if (!emails.length) return setStaffMap({});

    const { data: staffData } = await supabase
      .from("staff_profile")
      .select("full_name, email")
      .in("email", emails);

    const map = {};
    staffData?.forEach(s => (map[s.email] = s.full_name));
    setStaffMap(map);
  };

  // ================= STAFF =================
  const fetchStaff = async (booking) => {
    setSelectedBooking(booking);
    setShowStaff(true);
    setSelectedStaff(null);
    setAssignmentDone(false);

    const { data } = await supabase
      .from("staff_profile")
      .select("id, full_name, email, phone");

    setStaffList(data || []);
  };

  const confirmAssignment = async () => {
    if (!selectedBooking || !selectedStaff) return;

    await supabase
      .from("bookings")
      .update({ assigned_staff_email: selectedStaff.email })
      .eq("id", selectedBooking.id);

    setAssignmentDone(true);
    fetchBookings();
  };

  // ================= FILTER LOGIC =================
  const unassignedBookings = bookings.filter(b => !b.assigned_staff_email);
  const assignedBookings = bookings.filter(b => b.assigned_staff_email);

  const visibleBookings =
    activeTab === "unassigned" ? unassignedBookings : assignedBookings;

  const uniqueDates = [
    "ALL",
    ...Array.from(new Set(bookings.map(b => b.booking_date).filter(Boolean)))
      .sort((a, b) => new Date(a) - new Date(b))
  ];

  const timeToMinutes = (time) => {
    const [t, modifier] = time.split(" ");
    let [hours, minutes] = t.split(":").map(Number);

    if (modifier === "pm" && hours !== 12) hours += 12;
    if (modifier === "am" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  const uniqueTimes = [
    "ALL",
    ...Array.from(new Set(bookings.map(b => b.booking_time).filter(Boolean)))
      .sort((a, b) => timeToMinutes(a) - timeToMinutes(b))
  ];

  const filteredBookings = visibleBookings.filter(b =>
    (selectedDate === "ALL" || b.booking_date === selectedDate) &&
    (selectedTime === "ALL" || b.booking_time === selectedTime)
  );

  // ================= ASSIGN STAFF =================
  if (showStaff && selectedBooking && selectedStaff) {
    return (
      <div className="dashboard">
        <h2>Assign Staff</h2>

        <div style={{ maxWidth: "600px" }}>
          <div className="staff-card">
            <p><b>Name:</b> {selectedStaff.full_name}</p>
            <p><b>Email:</b> {selectedStaff.email}</p>
            <p><b>Phone:</b> {selectedStaff.phone}</p>

            {assignmentDone ? (
              <button className="allot-btn" disabled>Assigned</button>
            ) : (
              <button className="allot-btn" onClick={confirmAssignment}>
                Confirm Assignment
              </button>
            )}
          </div>
        </div>

        {/* ✅ ONLY CHANGE HERE */}
        <div className="staff-back-center">
          <button
            className="allot-btn"
            onClick={() => {
              setShowStaff(false);
              setSelectedStaff(null);
              setSelectedBooking(null);
            }}
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  // ================= AVAILABLE STAFF =================
  if (showStaff && selectedBooking) {
    return (
      <div className="dashboard">
        <h2>Available Staff</h2>

        <div className="staff-grid">
          {staffList.map(staff => (
            <div key={staff.id} className="staff-card">
              <p><b>Name:</b> {staff.full_name}</p>
              <p><b>Email:</b> {staff.email}</p>
              <p><b>Phone:</b> {staff.phone}</p>

              <button
                className="allot-btn"
                onClick={() => setSelectedStaff(staff)}
              >
                Assign
              </button>
            </div>
          ))}
        </div>

        <div className="staff-back-center">
          <button className="allot-btn" onClick={() => setShowStaff(false)}>
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  // ================= BOOKINGS TABLE =================
  return (
    <div className="dashboard">
      <h2>No of Bookings</h2>
      <h1>{bookings.length}</h1>

      <div className="dashboard-tabs" style={{ width: "100%" }}>
        <div style={{ display: "flex", gap: "30px" }}>
          <span
            className={activeTab === "unassigned" ? "active" : ""}
            onClick={() => setActiveTab("unassigned")}
          >
            Unassigned ({unassignedBookings.length})
          </span>

          <span
            className={activeTab === "assigned" ? "active" : ""}
            onClick={() => setActiveTab("assigned")}
          >
            Assigned ({assignedBookings.length})
          </span>
        </div>

        <div style={{ display: "flex", gap: "12px", marginLeft: "auto" }}>
          <select value={selectedDate} onChange={e => setSelectedDate(e.target.value)}>
            {uniqueDates.map(d => (
              <option key={d} value={d}>{d === "ALL" ? "Dates" : d}</option>
            ))}
          </select>

          <select value={selectedTime} onChange={e => setSelectedTime(e.target.value)}>
            {uniqueTimes.map(t => (
              <option key={t} value={t}>{t === "ALL" ? "Time" : t}</option>
            ))}
          </select>

          <button
            className="clear-filter-btn"
            onClick={() => {
              setSelectedDate("ALL");
              setSelectedTime("ALL");
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="booking-table-wrapper">
        <table className="booking-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Address</th>
              <th>Service</th>
              <th>Date</th>
              <th>Time</th>
              <th>Amount</th>
              <th>Payment Status</th>
              <th>Payment Method</th>
              <th>Assigned Staff</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredBookings.map(b => (
              <tr key={b.id}>
                <td>{b.customer_name}</td>
                <td>{b.phone_number}</td>
                <td>{b.email}</td>
                <td>{b.full_address}</td>
                <td>{b.services?.[0]?.title || "N/A"}</td>
                <td>{b.booking_date}</td>
                <td>{b.booking_time}</td>
                <td>₹{b.total_amount}</td>
                <td>{b.payment_status || "N/A"}</td>
                <td>{b.payment_method || "N/A"}</td>
                <td>
                  {b.assigned_staff_email
                    ? `${staffMap[b.assigned_staff_email]} (${b.assigned_staff_email})`
                    : "Not Assigned"}
                </td>
                <td>
                  <button className="allot-btn" onClick={() => fetchStaff(b)}>
                    {activeTab === "unassigned" ? "Allot Staff" : "Change Staff"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BookingPage;
