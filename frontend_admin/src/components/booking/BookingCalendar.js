"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button, Col, Input, Row } from "reactstrap";
import { toast } from "react-toastify";
import axios from "axios";
import BookingForm from "./BookingForm";

function getAuthHeaders() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token") || (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}") ?.token; } catch { return null; }
  })();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatDate(d) {
  return d.toISOString().split("T")[0];
}

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const MONTHS = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

function getDaysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(month, year) {
  const d = new Date(year, month - 1, 1).getDay();
  return d === 0 ? 6 : d - 1; // Monday = 0
}

export default function BookingCalendar() {
  const now = new Date();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [calendarData, setCalendarData] = useState({ bookings: [], lockedDays: [] });
  const [selectedDates, setSelectedDates] = useState([]);
  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  const [editBooking, setEditBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load rooms
  useEffect(() => {
    axios.get("/api/booking/rooms", { headers: getAuthHeaders() })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setRooms(data);
        if (data.length > 0 && !selectedRoom) setSelectedRoom(String(data[0].id));
      })
      .catch(() => toast.error("Không thể tải danh sách phòng."));
  }, []);

  // Load calendar data
  const loadCalendar = useCallback(async () => {
    if (!selectedRoom) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/booking/bookings/calendar?room_id=${selectedRoom}&month=${month}&year=${year}`,
        { headers: getAuthHeaders() }
      );
      setCalendarData(res.data || { bookings: [], lockedDays: [] });
    } catch {
      toast.error("Không thể tải lịch.");
    } finally {
      setLoading(false);
    }
  }, [selectedRoom, month, year]);

  useEffect(() => { loadCalendar(); }, [loadCalendar]);

  // Build date -> status map
  const dateStatusMap = useMemo(() => {
    const map = {};
    (calendarData.bookings || []).forEach((b) => {
      const start = new Date(b.check_in);
      const end = new Date(b.check_out);
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        map[formatDate(d)] = { type: "booked", booking: b };
      }
    });
    (calendarData.lockedDays || []).forEach((ld) => {
      const key = formatDate(new Date(ld.locked_date));
      if (!map[key]) map[key] = { type: "locked" };
    });
    return map;
  }, [calendarData]);

  // Calendar grid
  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfMonth(month, year);
  const calendarCells = useMemo(() => {
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ day: d, dateStr });
    }
    return cells;
  }, [month, year, daysInMonth, firstDay]);

  const toggleDate = (dateStr) => {
    const status = dateStatusMap[dateStr];
    if (status?.type === "booked") {
      // Click on booked date → open edit booking
      setEditBooking(status.booking);
      setBookingFormOpen(true);
      return;
    }
    setSelectedDates((prev) =>
      prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
    );
  };

  const onLockDays = async () => {
    if (selectedDates.length === 0) { toast.warning("Chọn ngày để khóa."); return; }
    try {
      await axios.post("/api/booking/lock-days", {
        room_id: Number(selectedRoom),
        dates: selectedDates,
      }, { headers: getAuthHeaders() });
      toast.success("Đã khóa phòng.");
      setSelectedDates([]);
      loadCalendar();
    } catch (error) {
      const msg = error?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg || "Lỗi khóa phòng.");
    }
  };

  const onUnlockDays = async () => {
    const lockedSelected = selectedDates.filter((d) => dateStatusMap[d]?.type === "locked");
    if (lockedSelected.length === 0) { toast.warning("Chọn ngày đã khóa để mở."); return; }
    try {
      await axios.delete("/api/booking/lock-days", {
        data: { room_id: Number(selectedRoom), dates: lockedSelected },
        headers: getAuthHeaders(),
      });
      toast.success("Đã mở khóa.");
      setSelectedDates([]);
      loadCalendar();
    } catch (error) {
      toast.error("Lỗi mở khóa.");
    }
  };

  const onCreateBooking = () => {
    if (selectedDates.length === 0) { toast.warning("Chọn ngày để tạo booking."); return; }
    // Check no booked/locked dates selected
    const conflict = selectedDates.find((d) => dateStatusMap[d]);
    if (conflict) { toast.warning("Không thể tạo booking cho ngày đã có booking hoặc bị khóa."); return; }
    setEditBooking(null);
    setBookingFormOpen(true);
  };

  const getCellStyle = (dateStr) => {
    const status = dateStatusMap[dateStr];
    const isSelected = selectedDates.includes(dateStr);
    const base = {
      width: "100%",
      aspectRatio: "1",
      border: "1px solid #e0e0e0",
      borderRadius: 8,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      fontSize: 14,
      fontWeight: 500,
      transition: "all 0.2s",
      position: "relative",
    };
    if (status?.type === "booked") {
      return { ...base, backgroundColor: "#4361ee", color: "#fff", border: "2px solid #3a56d4" };
    }
    if (status?.type === "locked") {
      return { ...base, backgroundColor: "#adb5bd", color: "#fff", border: "2px solid #6c757d" };
    }
    if (isSelected) {
      return { ...base, backgroundColor: "#f72585", color: "#fff", border: "2px solid #d1145a" };
    }
    return { ...base, backgroundColor: "#f8f9fa" };
  };

  return (
    <div>
      {/* Controls */}
      <Row className="mb-3 align-items-end">
        <Col md={3}>
          <label className="form-label fw-bold">Phòng</label>
          <Input type="select" value={selectedRoom} onChange={(e) => { setSelectedRoom(e.target.value); setSelectedDates([]); }}>
            {rooms.length === 0 && <option value="">Chưa có phòng</option>}
            {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </Input>
        </Col>
        <Col md={2}>
          <label className="form-label fw-bold">Tháng</label>
          <Input type="select" value={month} onChange={(e) => { setMonth(Number(e.target.value)); setSelectedDates([]); }}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </Input>
        </Col>
        <Col md={2}>
          <label className="form-label fw-bold">Năm</label>
          <Input type="select" value={year} onChange={(e) => { setYear(Number(e.target.value)); setSelectedDates([]); }}>
            {[year - 1, year, year + 1, year + 2].map((y) => <option key={y} value={y}>{y}</option>)}
          </Input>
        </Col>
        <Col md={5} className="d-flex gap-2 flex-wrap">
          <Button className="btn btn-gradient btn-pill" onClick={onCreateBooking} disabled={loading}>
            <i className="fa fa-plus me-1" /> Tạo Booking
          </Button>
          <Button className="btn btn-pill" style={{ background: "#6c757d", color: "#fff" }} onClick={onLockDays} disabled={loading}>
            <i className="fa fa-lock me-1" /> Khóa phòng
          </Button>
          <Button className="btn btn-pill btn-outline-secondary" onClick={onUnlockDays} disabled={loading}>
            <i className="fa fa-unlock me-1" /> Mở khóa
          </Button>
        </Col>
      </Row>

      {/* Legend */}
      <Row className="mb-3">
        <Col className="d-flex gap-3 align-items-center flex-wrap">
          <span className="d-flex align-items-center gap-1">
            <span style={{ width: 16, height: 16, borderRadius: 4, background: "#4361ee", display: "inline-block" }} /> Đã đặt
          </span>
          <span className="d-flex align-items-center gap-1">
            <span style={{ width: 16, height: 16, borderRadius: 4, background: "#adb5bd", display: "inline-block" }} /> Khóa
          </span>
          <span className="d-flex align-items-center gap-1">
            <span style={{ width: 16, height: 16, borderRadius: 4, background: "#f72585", display: "inline-block" }} /> Đang chọn
          </span>
          <span className="d-flex align-items-center gap-1">
            <span style={{ width: 16, height: 16, borderRadius: 4, background: "#f8f9fa", border: "1px solid #e0e0e0", display: "inline-block" }} /> Trống
          </span>
          {selectedDates.length > 0 && (
            <span className="ms-auto text-muted">
              Đã chọn: <strong>{selectedDates.length}</strong> ngày
              <Button size="sm" color="link" onClick={() => setSelectedDates([])}>Bỏ chọn</Button>
            </span>
          )}
        </Col>
      </Row>

      {/* Calendar Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {WEEKDAYS.map((wd) => (
          <div key={wd} style={{ textAlign: "center", fontWeight: 700, fontSize: 13, padding: "8px 0", color: "#6c757d" }}>
            {wd}
          </div>
        ))}
        {calendarCells.map((cell, idx) => {
          if (!cell) return <div key={`empty-${idx}`} />;
          const status = dateStatusMap[cell.dateStr];
          return (
            <div key={cell.dateStr} style={getCellStyle(cell.dateStr)} onClick={() => toggleDate(cell.dateStr)}>
              <span>{cell.day}</span>
              {status?.type === "booked" && (
                <span style={{ fontSize: 9, marginTop: 2, maxWidth: "90%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {status.booking.sources?.name || status.booking.customer_name}
                </span>
              )}
              {status?.type === "locked" && (
                <span style={{ fontSize: 9, marginTop: 2 }}>🔒</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Booking Form Modal */}
      <BookingForm
        isOpen={bookingFormOpen}
        toggle={() => { setBookingFormOpen(false); setEditBooking(null); }}
        roomId={Number(selectedRoom)}
        selectedDates={selectedDates}
        editBooking={editBooking}
        onSaved={() => { setSelectedDates([]); loadCalendar(); }}
      />
    </div>
  );
}
