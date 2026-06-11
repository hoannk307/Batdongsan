"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, FormGroup, Label, Input, Row, Col, Table } from "reactstrap";
import { toast } from "react-toastify";
import { getData, postData, putData } from "../../utils/apiRequests";



function formatDate(d) {
  if (!d) return "";
  const date = new Date(d);
  return date.toISOString().split("T")[0];
}

function daysBetween(d1, d2) {
  const a = new Date(d1);
  const b = new Date(d2);
  return Math.max(0, Math.round((b - a) / (1000 * 60 * 60 * 24)));
}

function formatMoney(v) {
  return Number(v || 0).toLocaleString("vi-VN");
}

export default function BookingForm({ isOpen, toggle, roomId, selectedDates, onSaved, editBooking }) {
  const [sources, setSources] = useState([]);
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    source_id: "",
    price_per_night: 0,
    check_in: "",
    check_out: "",
    comment: "",
    total_amount: 0,
    status: "DEPOSITED",
  });
  const [surcharges, setSurcharges] = useState([]);
  const [payments, setPayments] = useState([]);
  const [saving, setSaving] = useState(false);

  // Load sources
  useEffect(() => {
    if (isOpen) {
      getData("/api/booking/sources")
        .then((res) => {
          if (res && res.data) setSources(Array.isArray(res.data) ? res.data : []);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Init form
  useEffect(() => {
    if (isOpen) {
      if (editBooking) {
        setForm({
          customer_name: editBooking.customer_name || "",
          customer_phone: editBooking.customer_phone || "",
          source_id: editBooking.source_id || "",
          price_per_night: Number(editBooking.price_per_night) || 0,
          check_in: formatDate(editBooking.check_in),
          check_out: formatDate(editBooking.check_out),
          comment: editBooking.comment || "",
          total_amount: Number(editBooking.total_amount) || 0,
          status: editBooking.status || "DEPOSITED",
        });
        setSurcharges((editBooking.surcharges || []).map((s, i) => ({ ...s, _key: i, price: Number(s.price) })));
        setPayments((editBooking.payments || []).map((p, i) => ({ ...p, _key: i, amount: Number(p.amount), payment_date: formatDate(p.payment_date) })));
      } else {
        // New booking from selected dates
        const sorted = (selectedDates || []).slice().sort();
        const checkIn = sorted[0] || "";
        const checkOut = sorted.length > 0 ? (() => {
          const last = new Date(sorted[sorted.length - 1]);
          last.setDate(last.getDate() + 1);
          return formatDate(last);
        })() : "";
        setForm({
          customer_name: "",
          customer_phone: "",
          source_id: "",
          price_per_night: 0,
          check_in: checkIn,
          check_out: checkOut,
          comment: "",
          total_amount: 0,
          status: "DEPOSITED",
        });
        setSurcharges([]);
        setPayments([]);
      }
    }
  }, [isOpen, editBooking, selectedDates]);

  // Calculate estimated revenue
  const numNights = useMemo(() => {
    return form.check_in && form.check_out ? daysBetween(form.check_in, form.check_out) : 0;
  }, [form.check_in, form.check_out]);

  const totalSurcharges = useMemo(() => {
    return surcharges.reduce((acc, s) => acc + (Number(s.price) || 0), 0);
  }, [surcharges]);

  const estimatedRevenue = useMemo(() => {
    return (form.price_per_night * numNights) + totalSurcharges;
  }, [form.price_per_night, numNights, totalSurcharges]);

  // Auto-set total_amount to estimatedRevenue if not manually changed
  useEffect(() => {
    if (!editBooking) {
      setForm((prev) => ({ ...prev, total_amount: estimatedRevenue }));
    }
  }, [estimatedRevenue, editBooking]);

  // Surcharge handlers
  const addSurcharge = () => setSurcharges([...surcharges, { _key: Date.now(), name: "", price: 0, comment: "" }]);
  const removeSurcharge = (idx) => setSurcharges(surcharges.filter((_, i) => i !== idx));
  const updateSurcharge = (idx, field, val) => {
    const arr = [...surcharges];
    arr[idx] = { ...arr[idx], [field]: field === "price" ? Number(val) || 0 : val };
    setSurcharges(arr);
  };

  // Payment handlers
  const addPayment = () => setPayments([...payments, { _key: Date.now(), payment_date: formatDate(new Date()), amount: 0, comment: "" }]);
  const removePayment = (idx) => setPayments(payments.filter((_, i) => i !== idx));
  const updatePayment = (idx, field, val) => {
    const arr = [...payments];
    arr[idx] = { ...arr[idx], [field]: field === "amount" ? Number(val) || 0 : val };
    setPayments(arr);
  };

  const onSubmit = async () => {
    if (!form.customer_name.trim()) { toast.warning("Vui lòng nhập tên khách hàng."); return; }
    if (!form.check_in || !form.check_out) { toast.warning("Vui lòng nhập ngày check-in/check-out."); return; }
    if (new Date(form.check_in) >= new Date(form.check_out)) { toast.warning("Từ ngày phải nhỏ hơn Đến ngày."); return; }

    setSaving(true);
    try {
      const payload = {
        room_id: roomId,
        customer_name: form.customer_name,
        customer_phone: form.customer_phone || null,
        source_id: form.source_id ? Number(form.source_id) : null,
        check_in: form.check_in,
        check_out: form.check_out,
        price_per_night: Number(form.price_per_night) || 0,
        estimated_revenue: estimatedRevenue,
        total_amount: Number(form.total_amount) || estimatedRevenue,
        comment: form.comment || null,
        status: form.status,
        surcharges: surcharges.filter((s) => s.name.trim()).map((s) => ({
          name: s.name,
          price: Number(s.price) || 0,
          comment: s.comment || null,
        })),
        payments: payments.filter((p) => p.amount > 0).map((p) => ({
          payment_date: p.payment_date,
          amount: Number(p.amount) || 0,
          comment: p.comment || null,
        })),
      };

      if (editBooking) {
        await putData(`/api/booking/bookings/${editBooking.id}`, payload);
        toast.success("Cập nhật booking thành công.");
      } else {
        await postData("/api/booking/bookings", payload);
        toast.success("Tạo booking thành công.");
      }
      toggle();
      onSaved && onSaved();
    } catch (error) {
      const msg = error?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg || "Lỗi khi lưu booking.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" scrollable>
      <ModalHeader toggle={toggle}>
        {editBooking ? `Sửa Booking #${editBooking.id}` : "Tạo Booking mới"}
      </ModalHeader>
      <ModalBody>
        {/* Customer info */}
        <Row>
          <Col md={6}>
            <FormGroup>
              <Label>Tên khách hàng <span className="text-danger">*</span></Label>
              <Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
            </FormGroup>
          </Col>
          <Col md={6}>
            <FormGroup>
              <Label>Số điện thoại</Label>
              <Input value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} />
            </FormGroup>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <FormGroup>
              <Label>Nguồn khách (sale)</Label>
              <Input type="select" value={form.source_id} onChange={(e) => setForm({ ...form, source_id: e.target.value })}>
                <option value="">-- Chọn nguồn --</option>
                {sources.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Input>
            </FormGroup>
          </Col>
          <Col md={6}>
            <FormGroup>
              <Label>Đơn giá mỗi đêm (VNĐ)</Label>
              <Input type="number" value={form.price_per_night} onChange={(e) => setForm({ ...form, price_per_night: Number(e.target.value) || 0 })} />
            </FormGroup>
          </Col>
        </Row>

        {/* Dates */}
        <Row>
          <Col md={6}>
            <FormGroup>
              <Label>Từ ngày <span className="text-danger">*</span></Label>
              <Input type="date" value={form.check_in} onChange={(e) => setForm({ ...form, check_in: e.target.value })} />
            </FormGroup>
          </Col>
          <Col md={6}>
            <FormGroup>
              <Label>Đến ngày <span className="text-danger">*</span></Label>
              <Input type="date" value={form.check_out} onChange={(e) => setForm({ ...form, check_out: e.target.value })} />
            </FormGroup>
          </Col>
        </Row>

        <div className="alert alert-light p-2 mb-3">
          <strong>Số đêm:</strong> {numNights} đêm
        </div>

        {/* Surcharges */}
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Label className="fw-bold mb-0">Phụ phí</Label>
            <Button className="btn btn-sm btn-outline-primary" onClick={addSurcharge}>+ Thêm phụ phí</Button>
          </div>
          {surcharges.length > 0 && (
            <Table size="sm" bordered>
              <thead>
                <tr>
                  <th>Tên</th>
                  <th style={{ width: 150 }}>Giá (VNĐ)</th>
                  <th>Ghi chú</th>
                  <th style={{ width: 50 }}></th>
                </tr>
              </thead>
              <tbody>
                {surcharges.map((s, idx) => (
                  <tr key={s._key}>
                    <td><Input bsSize="sm" value={s.name} onChange={(e) => updateSurcharge(idx, "name", e.target.value)} /></td>
                    <td><Input bsSize="sm" type="number" value={s.price} onChange={(e) => updateSurcharge(idx, "price", e.target.value)} /></td>
                    <td><Input bsSize="sm" value={s.comment || ""} onChange={(e) => updateSurcharge(idx, "comment", e.target.value)} /></td>
                    <td><Button size="sm" color="danger" onClick={() => removeSurcharge(idx)}>×</Button></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          <div className="text-muted small">Tổng phụ phí: <strong>{formatMoney(totalSurcharges)} VNĐ</strong></div>
        </div>

        {/* Revenue */}
        <Row className="mb-3">
          <Col md={4}>
            <FormGroup>
              <Label className="fw-bold">Doanh thu ước tính</Label>
              <Input readOnly value={formatMoney(estimatedRevenue) + " VNĐ"} className="bg-light" />
              <small className="text-muted">({formatMoney(form.price_per_night)} × {numNights} đêm) + {formatMoney(totalSurcharges)} phụ phí</small>
            </FormGroup>
          </Col>
          <Col md={4}>
            <FormGroup>
              <Label className="fw-bold">Tổng thanh toán</Label>
              <Input type="number" value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: Number(e.target.value) || 0 })} />
              <small className="text-muted">Có thể sửa đổi</small>
            </FormGroup>
          </Col>
          <Col md={4}>
            <FormGroup>
              <Label className="fw-bold">Trạng thái</Label>
              <Input type="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="COMPLETED">Tất toán</option>
                <option value="DEPOSITED">Đã cọc</option>
                <option value="UNPAID">Chưa cọc</option>
              </Input>
            </FormGroup>
          </Col>
        </Row>

        {/* Payment installments */}
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Label className="fw-bold mb-0">Đợt thanh toán</Label>
            <Button className="btn btn-sm btn-outline-primary" onClick={addPayment}>+ Thêm đợt</Button>
          </div>
          {payments.length > 0 && (
            <Table size="sm" bordered>
              <thead>
                <tr>
                  <th style={{ width: 160 }}>Ngày thanh toán</th>
                  <th style={{ width: 150 }}>Số tiền (VNĐ)</th>
                  <th>Ghi chú</th>
                  <th style={{ width: 50 }}></th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, idx) => (
                  <tr key={p._key}>
                    <td><Input bsSize="sm" type="date" value={p.payment_date} onChange={(e) => updatePayment(idx, "payment_date", e.target.value)} /></td>
                    <td><Input bsSize="sm" type="number" value={p.amount} onChange={(e) => updatePayment(idx, "amount", e.target.value)} /></td>
                    <td><Input bsSize="sm" value={p.comment || ""} onChange={(e) => updatePayment(idx, "comment", e.target.value)} /></td>
                    <td><Button size="sm" color="danger" onClick={() => removePayment(idx)}>×</Button></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          {payments.length > 0 && (
            <div className="text-muted small">
              Đã thanh toán: <strong>{formatMoney(payments.reduce((a, p) => a + (Number(p.amount) || 0), 0))} VNĐ</strong>
              {" / "}Còn lại: <strong>{formatMoney((form.total_amount || estimatedRevenue) - payments.reduce((a, p) => a + (Number(p.amount) || 0), 0))} VNĐ</strong>
            </div>
          )}
        </div>

        {/* Comment */}
        <FormGroup>
          <Label>Ghi chú</Label>
          <Input type="textarea" rows={3} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button className="btn btn-gradient" disabled={saving} onClick={onSubmit}>
          {saving ? "Đang lưu..." : (editBooking ? "Cập nhật" : "Tạo Booking")}
        </Button>
        <Button className="btn btn-dashed" onClick={toggle}>Hủy</Button>
      </ModalFooter>
    </Modal>
  );
}
