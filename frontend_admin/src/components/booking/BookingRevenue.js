"use client";

import React, { Fragment, useCallback, useEffect, useState } from "react";
import {
  Button, Col, Input, Label, Row, Table, Nav, NavItem, NavLink,
  Modal, ModalHeader, ModalBody, ModalFooter, FormGroup,
} from "reactstrap";
import { toast } from "react-toastify";
import { getData, postData, putData, deleteData } from "../../utils/apiRequests";

const MONTHS = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

const STATUS_LABEL = {
  COMPLETED: { text: "Hoàn thành", cls: "badge bg-success" },
  DEPOSITED: { text: "Đã cọc", cls: "badge bg-info" },
  UNPAID: { text: "Chưa thanh toán", cls: "badge bg-warning text-dark" },
};

function formatVnd(n) {
  return new Intl.NumberFormat("vi-VN").format(Number(n) || 0);
}

/** Chỉ giữ lại chữ số — dùng cho ô nhập tiền có dấu phân cách nghìn. */
function digitsOnly(str) {
  return String(str ?? "").replace(/\D/g, "");
}

/**
 * check_in/check_out là cột `date`, backend trả về nửa đêm UTC.
 * Đọc theo UTC để không bị lệch 1 ngày ở máy có timezone khác.
 */
function formatDateVn(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getUTCFullYear()}`;
}

/** Thẻ tổng hợp: xếp ngang trên desktop, xếp dọc trên mobile. */
function SummaryTile({ label, value, color, hint }) {
  return (
    <Col xs={12} sm={4} className="mb-2">
      <div className="p-3 rounded h-100" style={{ background: "#f8f9fa", borderLeft: `4px solid ${color}` }}>
        <div className="text-muted" style={{ fontSize: 12 }}>{label}</div>
        <div className="fw-bold" style={{ fontSize: 20, color, wordBreak: "break-word" }}>
          {formatVnd(value)} đ
        </div>
        {hint && <div className="text-muted" style={{ fontSize: 11 }}>{hint}</div>}
      </div>
    </Col>
  );
}

export default function BookingRevenue() {
  const now = new Date();
  const [mode, setMode] = useState("month"); // "month" | "year"
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [roomId, setRoomId] = useState(""); // "" = tất cả các phòng
  const [rooms, setRooms] = useState([]);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ name: "", amount: "", comment: "" });
  const [saving, setSaving] = useState(false);

  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", amount: "", comment: "" });

  const yearOptions = [];
  for (let y = now.getFullYear() + 1; y >= now.getFullYear() - 5; y--) yearOptions.push(y);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const roomParam = roomId ? `&room_id=${roomId}` : "";
      const url = mode === "month"
        ? `/api/booking/revenue/monthly?month=${month}&year=${year}${roomParam}`
        : `/api/booking/revenue/yearly?year=${year}${roomParam}`;
      const res = await getData(url);
      setData(res?.data || null);
    } catch {
      toast.error("Không thể tải dữ liệu doanh thu.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [mode, month, year, roomId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getData("/api/booking/rooms");
        setRooms(Array.isArray(res?.data) ? res.data : []);
      } catch {
        toast.error("Không thể tải danh sách phòng.");
      }
    })();
  }, []);

  const resetForm = () => setForm({ name: "", amount: "", comment: "" });

  const onAddExpense = async () => {
    const amount = Number(digitsOnly(form.amount));
    if (!form.name.trim()) { toast.warning("Vui lòng nhập tên chi phí."); return; }
    if (!amount) { toast.warning("Vui lòng nhập số tiền lớn hơn 0."); return; }

    const payload = {
      period_type: mode === "month" ? "MONTH" : "YEAR",
      year,
      name: form.name.trim(),
      amount,
    };
    if (mode === "month") payload.month = month;
    // Chọn 1 phòng -> chi phí thuộc phòng đó. Chọn tất cả -> bỏ room_id = chi phí chung.
    if (roomId) payload.room_id = Number(roomId);
    if (form.comment.trim()) payload.comment = form.comment.trim();

    setSaving(true);
    try {
      await postData("/api/booking/expenses", payload);
      toast.success("Đã thêm chi phí phát sinh.");
      resetForm();
      load();
    } catch (error) {
      const msg = error?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg || "Lỗi khi lưu chi phí.");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (item) => {
    setEditItem(item);
    setEditForm({
      name: item.name || "",
      amount: formatVnd(item.amount),
      comment: item.comment || "",
    });
  };

  const onSaveEdit = async () => {
    const amount = Number(digitsOnly(editForm.amount));
    if (!editForm.name.trim()) { toast.warning("Vui lòng nhập tên chi phí."); return; }
    if (!amount) { toast.warning("Vui lòng nhập số tiền lớn hơn 0."); return; }

    try {
      await putData(`/api/booking/expenses/${editItem.id}`, {
        name: editForm.name.trim(),
        amount,
        comment: editForm.comment.trim(),
      });
      toast.success("Đã cập nhật chi phí.");
      setEditItem(null);
      load();
    } catch (error) {
      const msg = error?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg || "Lỗi khi cập nhật.");
    }
  };

  const onDeleteExpense = async (id) => {
    if (!confirm("Xóa chi phí phát sinh này?")) return;
    try {
      await deleteData(`/api/booking/expenses/${id}`);
      toast.success("Đã xóa.");
      load();
    } catch {
      toast.error("Không thể xóa chi phí.");
    }
  };

  const periodLabel = mode === "month" ? `${MONTHS[month - 1]}/${year}` : `năm ${year}`;
  const totals = data?.totals;
  const selectedRoom = rooms.find((r) => String(r.id) === String(roomId));
  const roomLabel = selectedRoom ? selectedRoom.name : "tất cả các phòng";

  return (
    <Fragment>
      {/* ===== Chọn kỳ thống kê ===== */}
      <Nav tabs className="mb-3">
        <NavItem>
          <NavLink href="#" className={mode === "month" ? "active" : ""}
            onClick={(e) => { e.preventDefault(); setMode("month"); }}>
            Theo tháng
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink href="#" className={mode === "year" ? "active" : ""}
            onClick={(e) => { e.preventDefault(); setMode("year"); }}>
            Theo năm
          </NavLink>
        </NavItem>
      </Nav>

      <Row className="mb-3">
        {mode === "month" && (
          <Col xs={6} md={3} className="mb-2">
            <Label className="form-label fw-bold">Tháng</Label>
            <Input type="select" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </Input>
          </Col>
        )}
        <Col xs={mode === "month" ? 6 : 12} md={3} className="mb-2">
          <Label className="form-label fw-bold">Năm</Label>
          <Input type="select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
          </Input>
        </Col>
        <Col xs={12} md={4} className="mb-2">
          <Label className="form-label fw-bold">Phòng</Label>
          <Input type="select" value={roomId} onChange={(e) => setRoomId(e.target.value)}>
            <option value="">Tất cả các phòng</option>
            {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </Input>
        </Col>
        <Col md={2} className="d-flex align-items-end mb-2">
          {loading && <span className="text-muted">Đang tải...</span>}
        </Col>
      </Row>

      {/* ===== Tổng hợp ===== */}
      {totals && (
        <Row className="mb-4">
          <SummaryTile label={`Tổng thu ${periodLabel}`} value={totals.total_income} color="#2a9d8f"
            hint={`${totals.booking_count} booking • ${roomLabel}`} />
          <SummaryTile label="Tổng chi phí phát sinh" value={totals.total_expense} color="#d00000"
            hint={mode === "year"
              ? `Chi phí tháng ${formatVnd(totals.total_month_expense)} đ + chi phí năm ${formatVnd(totals.total_year_expense)} đ`
              : undefined} />
          <SummaryTile label={`Doanh thu ${periodLabel}`} value={totals.revenue}
            color={totals.revenue >= 0 ? "#4361ee" : "#d00000"} hint="Tổng thu − tổng chi phí" />
        </Row>
      )}

      {/* ===== Bảng dữ liệu ===== */}
      {mode === "month" ? (
        <MonthlyBookings bookings={data?.bookings || []} loading={loading} />
      ) : (
        <YearlyMonths months={data?.months || []} loading={loading} totals={totals} />
      )}

      {/* ===== Chi phí phát sinh ===== */}
      <h6 className="fw-bold mt-4 mb-1">
        Chi phí phát sinh {mode === "month" ? `của ${MONTHS[month - 1]}/${year}` : `riêng của năm ${year}`}
        {selectedRoom ? ` — ${selectedRoom.name}` : ""}
      </h6>
      {mode === "year" && (
        <p className="text-muted mb-1" style={{ fontSize: 12 }}>
          Đây là các khoản chi chung cả năm (VD: bảo trì, thuế). Chi phí nhập ở từng tháng đã được trừ riêng trong bảng trên.
        </p>
      )}
      <p className="text-muted mb-2" style={{ fontSize: 12 }}>
        {selectedRoom
          ? `Chi phí nhập ở đây thuộc riêng phòng ${selectedRoom.name}. Chi phí chung không bị trừ vào phòng này.`
          : "Chi phí nhập ở đây là chi phí chung, không thuộc phòng nào. Bảng dưới hiện cả chi phí chung lẫn chi phí của từng phòng, tất cả đều được trừ vào doanh thu."}
      </p>

      {/* Form nhập: 1 hàng trên desktop, tự xếp dọc trên mobile nên không tràn màn hình */}
      <div className="p-3 rounded mb-3" style={{ background: "#f8f9fa" }}>
        <Row className="g-2 align-items-end">
          <Col xs={12} md={4}>
            <Label className="form-label" style={{ fontSize: 13 }}>Tên chi phí <span className="text-danger">*</span></Label>
            <Input value={form.name} placeholder="VD: Điện nước, giặt là..."
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Col>
          <Col xs={12} md={3}>
            <Label className="form-label" style={{ fontSize: 13 }}>Số tiền (đ) <span className="text-danger">*</span></Label>
            <Input value={form.amount} placeholder="0" inputMode="numeric" pattern="[0-9]*"
              onChange={(e) => setForm({ ...form, amount: formatVnd(digitsOnly(e.target.value)) })} />
          </Col>
          <Col xs={12} md={3}>
            <Label className="form-label" style={{ fontSize: 13 }}>Ghi chú</Label>
            <Input value={form.comment} placeholder="Không bắt buộc"
              onChange={(e) => setForm({ ...form, comment: e.target.value })} />
          </Col>
          <Col xs={12} md={2}>
            <Button className="btn btn-gradient w-100" disabled={saving} onClick={onAddExpense}>
              <i className="fa fa-plus me-1" /> {saving ? "Đang lưu..." : "Thêm"}
            </Button>
          </Col>
        </Row>
      </div>

      <ExpenseList
        rows={data?.expenses || []}
        showRoom={!selectedRoom}
        onEdit={openEdit}
        onDelete={onDeleteExpense}
      />

      {/* Modal sửa chi phí */}
      <Modal isOpen={!!editItem} toggle={() => setEditItem(null)}>
        <ModalHeader toggle={() => setEditItem(null)}>Sửa chi phí phát sinh</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>Tên chi phí <span className="text-danger">*</span></Label>
            <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          </FormGroup>
          <FormGroup>
            <Label>Số tiền (đ) <span className="text-danger">*</span></Label>
            <Input value={editForm.amount} inputMode="numeric" pattern="[0-9]*"
              onChange={(e) => setEditForm({ ...editForm, amount: formatVnd(digitsOnly(e.target.value)) })} />
          </FormGroup>
          <FormGroup>
            <Label>Ghi chú</Label>
            <Input type="textarea" value={editForm.comment}
              onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })} />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button className="btn btn-gradient" onClick={onSaveEdit}>Lưu</Button>
          <Button className="btn btn-dashed" onClick={() => setEditItem(null)}>Hủy</Button>
        </ModalFooter>
      </Modal>
    </Fragment>
  );
}

/** Danh sách booking của tháng: bảng trên desktop, card trên mobile. */
function MonthlyBookings({ bookings, loading }) {
  const empty = bookings.length === 0;

  return (
    <Fragment>
      <h6 className="fw-bold mb-1">Thu nhập theo từng booking</h6>
      <p className="text-muted mb-2" style={{ fontSize: 12 }}>
        Booking được tính trọn vào tháng trả phòng (check-out).
      </p>

      {/* Desktop */}
      <div className="table-responsive d-none d-md-block">
        <Table className="table">
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Phòng</th>
              <th>Nguồn</th>
              <th>Nhận / Trả phòng</th>
              <th className="text-center">Số đêm</th>
              <th>Trạng thái</th>
              <th className="text-end">Thu nhập</th>
            </tr>
          </thead>
          <tbody>
            {empty && (
              <tr><td colSpan={7} className="text-center text-muted">
                {loading ? "Đang tải..." : "Không có booking nào trong tháng này."}
              </td></tr>
            )}
            {bookings.map((b) => (
              <tr key={b.id}>
                <td className="fw-bold">{b.customer_name}</td>
                <td>{b.room_name || "-"}</td>
                <td>{b.source_name || "-"}</td>
                <td>{formatDateVn(b.check_in)} → {formatDateVn(b.check_out)}</td>
                <td className="text-center">{b.nights}</td>
                <td><span className={STATUS_LABEL[b.status]?.cls || "badge bg-secondary"}>
                  {STATUS_LABEL[b.status]?.text || b.status}
                </span></td>
                <td className="text-end fw-bold">{formatVnd(b.income)} đ</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Mobile */}
      <div className="d-md-none">
        {empty && (
          <div className="text-center text-muted py-3">
            {loading ? "Đang tải..." : "Không có booking nào trong tháng này."}
          </div>
        )}
        {bookings.map((b) => (
          <div key={b.id} className="border rounded p-2 mb-2">
            <div className="d-flex justify-content-between align-items-start gap-2">
              <div className="fw-bold" style={{ wordBreak: "break-word" }}>{b.customer_name}</div>
              <div className="fw-bold text-nowrap" style={{ color: "#2a9d8f" }}>{formatVnd(b.income)} đ</div>
            </div>
            <div className="text-muted" style={{ fontSize: 12 }}>
              {b.room_name || "-"}{b.source_name ? ` • ${b.source_name}` : ""}
            </div>
            <div style={{ fontSize: 12 }}>
              {formatDateVn(b.check_in)} → {formatDateVn(b.check_out)} ({b.nights} đêm)
            </div>
            <span className={`${STATUS_LABEL[b.status]?.cls || "badge bg-secondary"} mt-1`} style={{ fontSize: 10 }}>
              {STATUS_LABEL[b.status]?.text || b.status}
            </span>
          </div>
        ))}
      </div>
    </Fragment>
  );
}

/** Bảng doanh thu 12 tháng: bảng trên desktop, card trên mobile. */
function YearlyMonths({ months, loading, totals }) {
  if (loading && months.length === 0) {
    return <div className="text-center text-muted py-3">Đang tải...</div>;
  }

  return (
    <Fragment>
      <h6 className="fw-bold mb-2">Doanh thu các tháng</h6>

      {/* Desktop */}
      <div className="table-responsive d-none d-md-block">
        <Table className="table">
          <thead>
            <tr>
              <th>Tháng</th>
              <th className="text-center">Số booking</th>
              <th className="text-end">Tổng thu</th>
              <th className="text-end">Chi phí phát sinh</th>
              <th className="text-end">Doanh thu</th>
            </tr>
          </thead>
          <tbody>
            {months.map((m) => (
              <tr key={m.month}>
                <td className="fw-bold">{MONTHS[m.month - 1]}</td>
                <td className="text-center">{m.booking_count}</td>
                <td className="text-end">{formatVnd(m.total_income)} đ</td>
                <td className="text-end">{formatVnd(m.total_expense)} đ</td>
                <td className="text-end fw-bold" style={{ color: m.revenue >= 0 ? "#2a9d8f" : "#d00000" }}>
                  {formatVnd(m.revenue)} đ
                </td>
              </tr>
            ))}
          </tbody>
          {totals && (
            <tfoot>
              <tr style={{ background: "#f8f9fa" }}>
                <td className="fw-bold">Tổng 12 tháng</td>
                <td className="text-center fw-bold">{totals.booking_count}</td>
                <td className="text-end fw-bold">{formatVnd(totals.total_income)} đ</td>
                <td className="text-end fw-bold">{formatVnd(totals.total_month_expense)} đ</td>
                <td className="text-end fw-bold">
                  {formatVnd(totals.total_income - totals.total_month_expense)} đ
                </td>
              </tr>
            </tfoot>
          )}
        </Table>
      </div>

      {/* Mobile */}
      <div className="d-md-none">
        {months.map((m) => (
          <div key={m.month} className="border rounded p-2 mb-2">
            <div className="d-flex justify-content-between align-items-center">
              <span className="fw-bold">{MONTHS[m.month - 1]}</span>
              <span className="fw-bold" style={{ color: m.revenue >= 0 ? "#2a9d8f" : "#d00000" }}>
                {formatVnd(m.revenue)} đ
              </span>
            </div>
            <div className="text-muted" style={{ fontSize: 12 }}>
              {m.booking_count} booking • Thu {formatVnd(m.total_income)} đ • Chi {formatVnd(m.total_expense)} đ
            </div>
          </div>
        ))}
        {totals && (
          <div className="border rounded p-2 mb-2" style={{ background: "#f8f9fa" }}>
            <div className="d-flex justify-content-between align-items-center">
              <span className="fw-bold">Tổng 12 tháng</span>
              <span className="fw-bold">{formatVnd(totals.total_income - totals.total_month_expense)} đ</span>
            </div>
            <div className="text-muted" style={{ fontSize: 12 }}>
              Thu {formatVnd(totals.total_income)} đ • Chi {formatVnd(totals.total_month_expense)} đ
            </div>
          </div>
        )}
      </div>
    </Fragment>
  );
}

/** Nhãn phòng của 1 khoản chi phí. */
function RoomTag({ expense }) {
  return expense.room_name
    ? <span className="badge bg-light text-dark border">{expense.room_name}</span>
    : <span className="badge bg-secondary">Chung</span>;
}

/** Danh sách chi phí phát sinh: bảng trên desktop, card trên mobile. */
function ExpenseList({ rows, showRoom, onEdit, onDelete }) {
  const total = rows.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  if (rows.length === 0) {
    return <div className="text-muted mb-3" style={{ fontSize: 13 }}>Chưa có chi phí phát sinh nào.</div>;
  }

  return (
    <Fragment>
      {/* Desktop */}
      <div className="table-responsive d-none d-md-block">
        <Table className="table">
          <thead>
            <tr>
              <th>Tên chi phí</th>
              {showRoom && <th style={{ width: 140 }}>Thuộc phòng</th>}
              <th>Ghi chú</th>
              <th className="text-end">Số tiền</th>
              <th style={{ width: 150 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id}>
                <td className="fw-bold">{e.name}</td>
                {showRoom && <td><RoomTag expense={e} /></td>}
                <td>{e.comment || "-"}</td>
                <td className="text-end fw-bold" style={{ color: "#d00000" }}>{formatVnd(e.amount)} đ</td>
                <td className="d-flex gap-2">
                  <Button className="btn btn-sm btn-gradient" onClick={() => onEdit(e)}>Sửa</Button>
                  <Button className="btn btn-sm btn-danger" onClick={() => onDelete(e.id)}>Xóa</Button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: "#f8f9fa" }}>
              <td className="fw-bold" colSpan={showRoom ? 3 : 2}>Tổng chi phí</td>
              <td className="text-end fw-bold" style={{ color: "#d00000" }}>{formatVnd(total)} đ</td>
              <td />
            </tr>
          </tfoot>
        </Table>
      </div>

      {/* Mobile */}
      <div className="d-md-none">
        {rows.map((e) => (
          <div key={e.id} className="border rounded p-2 mb-2">
            <div className="d-flex justify-content-between align-items-start gap-2">
              <div className="fw-bold" style={{ wordBreak: "break-word" }}>{e.name}</div>
              <div className="fw-bold text-nowrap" style={{ color: "#d00000" }}>{formatVnd(e.amount)} đ</div>
            </div>
            {showRoom && <div className="mt-1"><RoomTag expense={e} /></div>}
            {e.comment && <div className="text-muted" style={{ fontSize: 12 }}>{e.comment}</div>}
            <div className="d-flex gap-2 mt-2">
              <Button className="btn btn-sm btn-gradient flex-fill" onClick={() => onEdit(e)}>Sửa</Button>
              <Button className="btn btn-sm btn-danger flex-fill" onClick={() => onDelete(e.id)}>Xóa</Button>
            </div>
          </div>
        ))}
        <div className="border rounded p-2 mb-2 d-flex justify-content-between" style={{ background: "#f8f9fa" }}>
          <span className="fw-bold">Tổng chi phí</span>
          <span className="fw-bold" style={{ color: "#d00000" }}>{formatVnd(total)} đ</span>
        </div>
      </div>
    </Fragment>
  );
}
