"use client";

import Link from "next/link";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Button, Col, Input, Row, Table, Badge } from "reactstrap";
import { toast } from "react-toastify";
import axios from "axios";

function getAuthConfig() {
  let token = null;
  if (typeof window !== "undefined") {
    token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      (() => {
        try {
          return JSON.parse(localStorage.getItem("user") || "{}")?.token;
        } catch {
          return null;
        }
      })();
  }
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}

const DEFAULT_LIMIT = 20;

export default function UsersList() {
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword.trim()) params.set("keyword", keyword.trim());
      const res = await axios.get(`/api/users?${params.toString()}`, getAuthConfig());
      setRows(res.data || []);
    } catch (error) {
      const msg = error?.response?.data?.message;
      const normalized = Array.isArray(msg) ? msg.join(", ") : msg;
      toast.error(normalized || "Không thể tải danh sách user.");
      console.error("UsersList load error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Client-side filter (role + status)
  const filteredRows = useMemo(() => {
    let data = rows;
    if (roleFilter) data = data.filter((u) => u.role === roleFilter);
    if (statusFilter === "BLOCKED") data = data.filter((u) => u.is_blocked);
    if (statusFilter === "ACTIVE") data = data.filter((u) => !u.is_blocked);
    return data;
  }, [rows, roleFilter, statusFilter]);

  // Client-side pagination
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / limit));
  const pagedRows = filteredRows.slice((page - 1) * limit, page * limit);

  const onDelete = async (id, username) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa user "${username}" không? Hành động này không thể hoàn tác.`))
      return;
    try {
      await axios.delete(`/api/users/${id}`, getAuthConfig());
      toast.success("Đã xóa user.");
      setRows((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      const msg = error?.response?.data?.message;
      const normalized = Array.isArray(msg) ? msg.join(", ") : msg;
      toast.error(normalized || "Không thể xóa user.");
    }
  };

  const onToggleBlock = async (user) => {
    const action = user.is_blocked ? "mở khóa" : "khóa";
    if (!window.confirm(`Bạn có chắc chắn muốn ${action} user "${user.username}"?`)) return;
    try {
      const res = await axios.patch(`/api/users/${user.id}/block`, {}, getAuthConfig());
      const updated = res.data;
      toast.success(`Đã ${action} user thành công.`);
      setRows((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_blocked: updated.is_blocked } : u))
      );
    } catch (error) {
      const msg = error?.response?.data?.message;
      const normalized = Array.isArray(msg) ? msg.join(", ") : msg;
      toast.error(normalized || `Không thể ${action} user.`);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  return (
    <Fragment>
      {/* Toolbar */}
      <Row className="mb-3 align-items-end g-2">
        <Col md="4">
          <label className="form-label">Tìm kiếm</label>
          <form onSubmit={handleSearch} className="d-flex gap-2">
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tên, email, số điện thoại..."
            />
            <Button type="submit" className="btn btn-gradient btn-pill" disabled={loading}>
              {loading ? "..." : "Tìm"}
            </Button>
          </form>
        </Col>

        <Col md="2">
          <label className="form-label">Role</label>
          <Input
            type="select"
            value={roleFilter}
            onChange={(e) => {
              setPage(1);
              setRoleFilter(e.target.value);
            }}
          >
            <option value="">Tất cả</option>
            <option value="ADMIN">ADMIN</option>
            <option value="USER">USER</option>
          </Input>
        </Col>

        <Col md="2">
          <label className="form-label">Trạng thái</label>
          <Input
            type="select"
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
          >
            <option value="">Tất cả</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="BLOCKED">Đã khóa</option>
          </Input>
        </Col>

        <Col md="2">
          <label className="form-label">Hiển thị</label>
          <Input
            type="select"
            value={String(limit)}
            onChange={(e) => {
              setPage(1);
              setLimit(Number(e.target.value));
            }}
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={String(n)}>
                {n} / trang
              </option>
            ))}
          </Input>
        </Col>

        <Col md="2" className="d-flex gap-2">
          <Button
            className="btn btn-dashed btn-pill"
            disabled={loading}
            onClick={() => {
              setPage(1);
              load();
            }}
          >
            {loading ? "Loading..." : "Reload"}
          </Button>
          <Link className="btn btn-gradient btn-pill" href="/manage-users/add-user">
            + Thêm
          </Link>
        </Col>
      </Row>

      {/* Table */}
      <div className="table-responsive">
        <Table className="table">
          <thead>
            <tr>
              <th style={{ width: 60 }}>ID</th>
              <th>Tên / Username</th>
              <th>Email</th>
              <th style={{ width: 130 }}>Điện thoại</th>
              <th style={{ width: 90 }}>Role</th>
              <th style={{ width: 110 }}>Trạng thái</th>
              <th style={{ width: 180 }}>Ngày tạo</th>
              <th style={{ width: 220 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {pagedRows.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-4">
                  {loading ? "Đang tải..." : "Không có dữ liệu"}
                </td>
              </tr>
            )}
            {pagedRows.map((u) => (
              <tr key={u.id} className={u.is_blocked ? "table-warning" : ""}>
                <td>{u.id}</td>
                <td>
                  <div className="fw-bold">{u.full_name || "—"}</div>
                  <div className="text-muted small">@{u.username}</div>
                </td>
                <td>{u.email}</td>
                <td>{u.phone || "—"}</td>
                <td>
                  <Badge color={u.role === "ADMIN" ? "danger" : "secondary"} pill>
                    {u.role}
                  </Badge>
                </td>
                <td>
                  {u.is_blocked ? (
                    <Badge color="warning" pill>
                      Đã khóa
                    </Badge>
                  ) : (
                    <Badge color="success" pill>
                      Hoạt động
                    </Badge>
                  )}
                </td>
                <td>{u.created_at ? new Date(u.created_at).toLocaleDateString("vi-VN") : "—"}</td>
                <td>
                  <div className="d-flex gap-1 flex-wrap">
                    <Link
                      className="btn btn-sm btn-gradient"
                      href={`/manage-users/edit-user?id=${u.id}`}
                    >
                      Edit
                    </Link>
                    <Button
                      className={`btn btn-sm ${u.is_blocked ? "btn-success" : "btn-warning"}`}
                      onClick={() => onToggleBlock(u)}
                    >
                      {u.is_blocked ? "Mở khóa" : "Block"}
                    </Button>
                    <Button
                      className="btn btn-sm btn-danger"
                      onClick={() => onDelete(u.id, u.username)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Pagination */}
      <Row className="mt-2 align-items-center">
        <Col md="6" className="text-muted small">
          Trang {page} / {totalPages} — Tổng {filteredRows.length} user
        </Col>
        <Col md="6" className="d-flex justify-content-end gap-2">
          <Button
            className="btn btn-dashed"
            disabled={loading || page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </Button>
          <Button
            className="btn btn-dashed"
            disabled={loading || page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </Col>
      </Row>
    </Fragment>
  );
}
