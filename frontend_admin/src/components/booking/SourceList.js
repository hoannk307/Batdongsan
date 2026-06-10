"use client";

import React, { Fragment, useEffect, useState } from "react";
import { Button, Col, Input, Row, Table, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label } from "reactstrap";
import { toast } from "react-toastify";
import axios from "axios";

function getAuthHeaders() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token") || (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}") ?.token; } catch { return null; }
  })();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function SourceList() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: "", comment: "" });

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/booking/sources", { headers: getAuthHeaders() });
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error("Không thể tải danh sách nguồn khách.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: "", comment: "" });
    setModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name || "", comment: item.comment || "" });
    setModal(true);
  };

  const onSave = async () => {
    if (!form.name.trim()) { toast.warning("Vui lòng nhập tên nguồn khách."); return; }
    try {
      if (editItem) {
        await axios.put(`/api/booking/sources/${editItem.id}`, form, { headers: getAuthHeaders() });
        toast.success("Cập nhật thành công.");
      } else {
        await axios.post("/api/booking/sources", form, { headers: getAuthHeaders() });
        toast.success("Thêm mới thành công.");
      }
      setModal(false);
      load();
    } catch (error) {
      const msg = error?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg || "Lỗi khi lưu.");
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Xóa nguồn khách này?")) return;
    try {
      await axios.delete(`/api/booking/sources/${id}`, { headers: getAuthHeaders() });
      toast.success("Đã xóa.");
      load();
    } catch (error) {
      toast.error("Không thể xóa.");
    }
  };

  return (
    <Fragment>
      <Row className="mb-3">
        <Col className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Nguồn khách hàng</h5>
          <Button className="btn btn-gradient btn-pill" onClick={openAdd}>
            <i className="fa fa-plus me-1" /> Thêm mới
          </Button>
        </Col>
      </Row>

      <div className="table-responsive">
        <Table className="table">
          <thead>
            <tr>
              <th style={{ width: 60 }}>ID</th>
              <th>Tên nguồn khách</th>
              <th>Ghi chú</th>
              <th style={{ width: 160 }}>Ngày tạo</th>
              <th style={{ width: 180 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={5}>{loading ? "Đang tải..." : "Không có dữ liệu"}</td></tr>
            )}
            {rows.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td className="fw-bold">{item.name}</td>
                <td>{item.comment || "-"}</td>
                <td>{item.created_at ? new Date(item.created_at).toLocaleDateString("vi-VN") : "-"}</td>
                <td className="d-flex gap-2">
                  <Button className="btn btn-sm btn-gradient" onClick={() => openEdit(item)}>Sửa</Button>
                  <Button className="btn btn-sm btn-danger" onClick={() => onDelete(item.id)}>Xóa</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Modal isOpen={modal} toggle={() => setModal(false)}>
        <ModalHeader toggle={() => setModal(false)}>
          {editItem ? "Sửa nguồn khách" : "Thêm nguồn khách"}
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>Tên nguồn khách <span className="text-danger">*</span></Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VD: Booking.com, Zalo, ..." />
          </FormGroup>
          <FormGroup>
            <Label>Ghi chú</Label>
            <Input type="textarea" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button className="btn btn-gradient" onClick={onSave}>Lưu</Button>
          <Button className="btn btn-dashed" onClick={() => setModal(false)}>Hủy</Button>
        </ModalFooter>
      </Modal>
    </Fragment>
  );
}
