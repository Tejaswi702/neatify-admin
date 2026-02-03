import { useEffect, useState } from "react";
import { supabase } from "../supabase";

function BookingPage() {
  const [bookings, setBookings] = useState([]);
  const [staffMap, setStaffMap] = useState({});
  const [activeTab, setActiveTab] = useState("unassigned");

  const [selectedDate, setSelectedDate] = useState("ALL");
  const [selectedTime, setSelectedTime] = useState("ALL");

  const [showStaff, setShowStaff] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [assignmentDone, setAssignmentDone] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  /* ================= FETCH BOOKINGS ================= */
  const fetchBookings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    setBookings(data || []);

    const emails = data?.map(b => b.assigned_staff_email).filter(Boolean);
    if (!emails?.length) return setStaffMap({});

    const { data: staffData } = await supabase
      .from("staff_profile")
      .select("full_name, email")
      .in("email", emails);

    const map = {};
    staffData?.forEach(s => (map[s.email] = s.full_name));
    setStaffMap(map);
  };

  /* ================= STAFF ================= */
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

  /* ================= OTP ================= */
  const generateOtp = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  const confirmAssignment = async () => {
    if (!selectedBooking || !selectedStaff) return;

    let startOtp = generateOtp();
    let endOtp = generateOtp();
    while (startOtp === endOtp) endOtp = generateOtp();

    const { error } = await supabase
      .from("bookings")
      .update({
        assigned_staff_email: selectedStaff.email,
        startotp: startOtp,
        endotp: endOtp,
      })
      .eq("id", selectedBooking.id);

    if (!error) {
      alert("✅ Start OTP and End OTP have been saved in the bookings.");
      setAssignmentDone(true);
      fetchBookings();
    }
  };

  /* ================= SORT HELPERS ================= */

  // Normalize & parse time → AM first, then PM
  const parseTime = (time) => {
    if (!time) return { period: "am", minutes: 0 };

    // normalize formats: 3.00pm → 3:00 pm
    let t = time.toLowerCase().replace(".", ":");
    if (!t.includes(" ")) {
      t = t.replace("am", " am").replace("pm", " pm");
    }

    const [timePart, period] = t.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);

    if (hours === 12) hours = 0;

    return {
      period, // am / pm
      minutes: hours * 60 + minutes
    };
  };

  /* ================= FILTER LOGIC ================= */
  const unassignedBookings = bookings.filter(b => !b.assigned_staff_email);
  const assignedBookings = bookings.filter(b => b.assigned_staff_email);
  const visibleBookings =
    activeTab === "unassigned" ? unassignedBookings : assignedBookings;

  // Dates ASC
  const uniqueDates = [
    "ALL",
    ...Array.from(
      new Set(bookings.map(b => b.booking_date).filter(Boolean))
    ).sort((a, b) => new Date(a) - new Date(b))
  ];

  // Times → AM first, PM later (both ascending)
  const uniqueTimes = [
    "ALL",
    ...Array.from(
      new Set(bookings.map(b => b.booking_time).filter(Boolean))
    ).sort((a, b) => {
      const ta = parseTime(a);
      const tb = parseTime(b);

      if (ta.period !== tb.period) {
        return ta.period === "am" ? -1 : 1;
      }
      return ta.minutes - tb.minutes;
    })
  ];

  const filteredBookings = visibleBookings.filter(b =>
    (selectedDate === "ALL" || b.booking_date === selectedDate) &&
    (selectedTime === "ALL" || b.booking_time === selectedTime)
  );

  /* ================= ASSIGN STAFF ================= */
  if (showStaff && selectedBooking && selectedStaff) {
    return (
      <div className="dashboard">
        <h2>Assign Staff</h2>

        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <div className="staff-card" style={{ maxWidth: "500px" }}>
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

        <div style={{ textAlign: "center", marginTop: "30px" }}>
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

  /* ================= AVAILABLE STAFF ================= */
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

              <button className="allot-btn" onClick={() => setSelectedStaff(staff)}>
                Assign
              </button>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button className="allot-btn" onClick={() => setShowStaff(false)}>
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  /* ================= BOOKINGS TABLE ================= */
  return (
    <div className="dashboard">
      <h2>No of Bookings</h2>
      <h1>{bookings.length}</h1>

      <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "30px" }}>
          <span
            className={activeTab === "unassigned" ? "active" : ""}
            onClick={() => setActiveTab("unassigned")}
            style={{ cursor: "pointer" }}

          >
            Unassigned ({unassignedBookings.length})
          </span>

          <span
            className={activeTab === "assigned" ? "active" : ""}
            onClick={() => setActiveTab("assigned")}
            style={{ cursor: "pointer" }}

          >
            Assigned ({assignedBookings.length})
          </span>
        </div>

        <div style={{ display: "flex", gap: "12px", marginLeft: "auto" }}>
          <select style={{ cursor: "pointer" }} value={selectedDate} onChange={e => setSelectedDate(e.target.value)}>
            {uniqueDates.map(d => (
              <option key={d} value={d}>
                {d === "ALL" ? "Dates" : d}
              </option>
            ))}
          </select>

          <select style={{ cursor: "pointer" }}  value={selectedTime} onChange={e => setSelectedTime(e.target.value)}>
            {uniqueTimes.map(t => (
              <option key={t} value={t}>
                {t === "ALL" ? "Time" : t}
              </option>
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

      <table className="booking-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Service</th>
            <th>Date</th>
            <th>Time</th>
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
              <td>{b.services?.[0]?.title || "N/A"}</td>
              <td>{b.booking_date}</td>
              <td>{b.booking_time}</td>
              <td>{b.assigned_staff_email ? staffMap[b.assigned_staff_email] : "Not Assigned"}</td>
              <td>
                <button className="allot-btn" onClick={() => fetchStaff(b)}>
                  {b.assigned_staff_email ? "Change Staff" : "Allot Staff"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BookingPage;
