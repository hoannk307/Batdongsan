"use client";

import React, { Fragment, useEffect, useState } from "react";
import { Button, Col, Input, Row, Table, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label } from "reactstrap";
import { toast } from "react-toastify";
import { getData, postData, putData, deleteData } from "../../utils/apiRequests";



export default function RoomList() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: "", comment: "" });

  const load = async () => {
    setLoading(true);
    try {
      const res = await getData("/api/booking/rooms");
      if (res && res.data) {
        setRows(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách phòng.");
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
    if (!form.name.trim()) { toast.warning("Vui lòng nhập tên phòng."); return; }
    try {
      if (editItem) {
        await putData(`/api/booking/rooms/${editItem.id}`, form);
        toast.success("Cập nhật thành công.");
      } else {
        await postData("/api/booking/rooms", form);
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
    if (!confirm("Xóa phòng này? Tất cả bookings liên quan sẽ bị xóa.")) return;
    try {
      await deleteData(`/api/booking/rooms/${id}`);
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
          <h5 className="mb-0">Quản lý phòng</h5>
          <Button className="btn btn-gradient btn-pill" onClick={openAdd}>
            <i className="fa fa-plus me-1" /> Thêm phòng
          </Button>
        </Col>
      </Row>

      <div className="table-responsive">
        <Table className="table">
          <thead>
            <tr>
              <th style={{ width: 60 }}>ID</th>
              <th>Tên phòng</th>
              <th>Ảnh</th>
              <th>Ghi chú</th>
              <th style={{ width: 160 }}>Ngày tạo</th>
              <th style={{ width: 180 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={6}>{loading ? "Đang tải..." : "Chưa có phòng nào"}</td></tr>
            )}
            {rows.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td className="fw-bold">{item.name}</td>
                <td>
                  {item.img ? (
                    <img src={item.img} alt={item.name} style={{ width: 60, height: 40, objectFit: "cover", borderRadius: 4 }} />
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
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
          {editItem ? "Sửa phòng" : "Thêm phòng"}
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>Tên phòng <span className="text-danger">*</span></Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VD: Phòng 101, Villa A, ..." />
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
