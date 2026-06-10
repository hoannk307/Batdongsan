"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Col, Input, Row } from "reactstrap";
import { toast } from "react-toastify";
import { getData } from "../../utils/apiRequests";



function formatDate(d) {
  return new Date(d).toISOString().split("T")[0];
}

const MONTHS = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

function getDaysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

// Generate a consistent color from a string
function stringToColor(str) {
  if (!str) return "#4361ee";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ["#4361ee", "#f72585", "#7209b7", "#3a0ca3", "#4cc9f0", "#4895ef", "#560bad", "#480ca8", "#b5179e", "#f77f00"];
  return colors[Math.abs(hash) % colors.length];
}

export default function BookingDashboard() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState({ rooms: [], bookings: [], lockedDays: [] });
  const [loading, setLoading] = useState(false);

  const loadTimeline = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getData(
        `/api/booking/bookings/timeline?month=${month}&year=${year}`
      );
      if (res && res.data) {
        setData(res.data || { rooms: [], bookings: [], lockedDays: [] });
      } else {
        setData({ rooms: [], bookings: [], lockedDays: [] });
      }
    } catch {
      toast.error("Không thể tải timeline.");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { loadTimeline(); }, [loadTimeline]);

  const daysInMonth = getDaysInMonth(month, year);
  const dayNumbers = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  // Build map: roomId -> dateStr -> booking/locked
  const cellMap = useMemo(() => {
    const map = {};

    (data.bookings || []).forEach((b) => {
      const start = new Date(b.check_in);
      const end = new Date(b.check_out);
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        const key = `${b.room_id}-${formatDate(d)}`;
        map[key] = { type: "booked", booking: b };
      }
    });

    (data.lockedDays || []).forEach((ld) => {
      const key = `${ld.room_id}-${formatDate(new Date(ld.locked_date))}`;
      if (!map[key]) map[key] = { type: "locked" };
    });

    return map;
  }, [data]);

  const today = formatDate(new Date());

  return (
    <div>
      {/* Controls */}
      <Row className="mb-3 align-items-end">
        <Col md={3}>
          <label className="form-label fw-bold">Tháng</label>
          <Input type="select" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </Input>
        </Col>
        <Col md={2}>
          <label className="form-label fw-bold">Năm</label>
          <Input type="select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {[year - 1, year, year + 1, year + 2].map((y) => <option key={y} value={y}>{y}</option>)}
          </Input>
        </Col>
        <Col>
          {loading && <span className="text-muted">Đang tải...</span>}
        </Col>
      </Row>

      {/* Legend */}
      <Row className="mb-2">
        <Col className="d-flex gap-3 align-items-center flex-wrap small">
          <span className="d-flex align-items-center gap-1">
            <span style={{ width: 14, height: 14, borderRadius: 3, background: "#4361ee", display: "inline-block" }} /> Đã đặt
          </span>
          <span className="d-flex align-items-center gap-1">
            <span style={{ width: 14, height: 14, borderRadius: 3, background: "#adb5bd", display: "inline-block" }} /> Khóa
          </span>
          <span className="d-flex align-items-center gap-1">
            <span style={{ width: 14, height: 14, borderRadius: 3, background: "#fff3cd", border: "1px solid #ffc107", display: "inline-block" }} /> Hôm nay
          </span>
        </Col>
      </Row>

      {/* Timeline Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", minWidth: "100%" }}>
          <thead>
            <tr>
              <th style={{
                position: "sticky", left: 0, zIndex: 2,
                background: "#2b2d42", color: "#fff",
                padding: "10px 16px", minWidth: 140,
                borderRight: "2px solid #8d99ae",
                fontWeight: 600, fontSize: 13,
              }}>
                Phòng
              </th>
              {dayNumbers.map((d) => {
                const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                const isToday = dateStr === today;
                const dow = new Date(year, month - 1, d).getDay();
                const isWeekend = dow === 0 || dow === 6;
                return (
                  <th key={d} style={{
                    padding: "6px 2px", textAlign: "center",
                    fontSize: 11, fontWeight: 600, minWidth: 38,
                    background: isToday ? "#fff3cd" : isWeekend ? "#f0f0f5" : "#edf2f4",
                    color: isToday ? "#856404" : isWeekend ? "#d90429" : "#2b2d42",
                    borderBottom: "2px solid #8d99ae",
                  }}>
                    <div>{d}</div>
                    <div style={{ fontSize: 9, fontWeight: 400 }}>{["CN", "T2", "T3", "T4", "T5", "T6", "T7"][dow]}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {(data.rooms || []).length === 0 && (
              <tr>
                <td colSpan={daysInMonth + 1} style={{ padding: 20, textAlign: "center", color: "#adb5bd" }}>
                  {loading ? "Đang tải..." : "Chưa có phòng nào. Hãy thêm phòng trong mục Quản lý phòng."}
                </td>
              </tr>
            )}
            {(data.rooms || []).map((room, rIdx) => (
              <tr key={room.id} style={{ background: rIdx % 2 === 0 ? "#fff" : "#f8f9fa" }}>
                <td style={{
                  position: "sticky", left: 0, zIndex: 1,
                  background: rIdx % 2 === 0 ? "#fff" : "#f8f9fa",
                  padding: "8px 12px",
                  borderRight: "2px solid #e0e0e0",
                  fontWeight: 600, fontSize: 13,
                  whiteSpace: "nowrap",
                }}>
                  {room.name}
                </td>
                {dayNumbers.map((d) => {
                  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                  const isToday = dateStr === today;
                  const cell = cellMap[`${room.id}-${dateStr}`];

                  let bgColor = "transparent";
                  let content = null;

                  if (cell?.type === "booked") {
                    const sourceName = cell.booking.sources?.name || "";
                    bgColor = stringToColor(sourceName);
                    content = (
                      <span style={{ fontSize: 8, color: "#fff", lineHeight: 1.1, display: "block", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 34 }}>
                        {sourceName || cell.booking.customer_name?.charAt(0) || "•"}
                      </span>
                    );
                  } else if (cell?.type === "locked") {
                    bgColor = "#adb5bd";
                    content = <span style={{ fontSize: 9, color: "#fff" }}>🔒</span>;
                  }

                  return (
                    <td key={d} style={{
                      padding: 1, textAlign: "center", verticalAlign: "middle",
                      border: "1px solid #eee",
                      background: cell ? bgColor : isToday ? "#fff3cd" : "transparent",
                      minWidth: 38, height: 36,
                    }} title={cell?.type === "booked" ? `${cell.booking.customer_name} (${cell.booking.sources?.name || "N/A"})` : cell?.type === "locked" ? "Đã khóa" : ""}>
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
