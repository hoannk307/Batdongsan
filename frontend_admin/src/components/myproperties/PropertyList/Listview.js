"use client";

import Link from "next/link";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Button, Col, Input, Row, Table } from "reactstrap";
import { toast } from "react-toastify";
import { getData, deleteData } from "@/utils/apiRequests";

const DEFAULT_LIMIT = 20;

export default function Listview() {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [status, setStatus] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [keyword, setKeyword] = useState("");

  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(status ? { propertyStatus: status } : {}),
        ...(propertyType ? { propertyTypes: propertyType } : {}),
      }).toString();

      const res = await getData(`/api/properties/admin/list?${query}`);
      setRows(res.data?.data || []);
      setPagination(res.data?.pagination || null);
    } catch (error) {
      toast.error("Không thể tải danh sách bất động sản.");
      console.error("Listview load error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, status, propertyType]);

  const filteredRows = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return rows;
    return rows.filter((n) => {
      const hay = `${n?.title || ""} ${n?.address || ""} ${n?.property_type || ""}`.toLowerCase();
      return hay.includes(kw);
    });
  }, [rows, keyword]);

  const onDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bất động sản này không?")) return;
    try {
      await deleteData(`/api/properties/${id}`);
      toast.success("Đã xóa bất động sản.");
      load();
    } catch (error) {
      const messageFromApi = error?.response?.data?.message;
      const normalizedMessage = Array.isArray(messageFromApi) ? messageFromApi.join(", ") : messageFromApi;
      toast.error(normalizedMessage || "Không thể xóa bất động sản.");
    }
  };

  return (
    <Fragment>
      <Row className="mb-3 align-items-end">
        <Col md="3">
          <label className="form-label">Tìm kiếm</label>
          <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tiêu đề / Địa chỉ..." />
        </Col>
        <Col md="2">
          <label className="form-label">Trạng thái</label>
          <Input
            type="select"
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
          >
            <option value="">Tất cả</option>
            <option value="FOR_SALE">Bán</option>
            <option value="FOR_RENT">Cho Thuê</option>
          </Input>
        </Col>
        <Col md="3">
          <label className="form-label">Loại BĐS (API filter)</label>
          <Input
            value={propertyType}
            onChange={(e) => {
              setPage(1);
              setPropertyType(e.target.value);
            }}
            placeholder="VD: Nhà đất"
          />
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
                {n}
              </option>
            ))}
          </Input>
        </Col>
        <Col md="2" className="d-flex gap-2">
          <Button className="btn btn-gradient btn-pill" disabled={loading} onClick={() => load()}>
            {loading ? "Đang tải..." : "Tải lại"}
          </Button>
        </Col>
      </Row>

      <div className="table-responsive">
        <Table className="table">
          <thead>
            <tr>
              <th style={{ width: 80 }}>ID</th>
              <th>Tiêu đề / Địa chỉ</th>
              <th style={{ width: 140 }}>Loại</th>
              <th style={{ width: 120 }}>Trạng thái</th>
              <th style={{ width: 130 }}>Phê duyệt</th>
              <th style={{ width: 150 }}>Giá</th>
              <th style={{ width: 180 }}>Ngày tạo</th>
              <th style={{ width: 220 }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={8}>{loading ? "Đang tải..." : "Không có dữ liệu"}</td>
              </tr>
            )}
            {filteredRows.map((n) => {
              const isDraft = n.status !== "PUBLISHED";
              return (
                <tr
                  key={n.id}
                  style={isDraft ? { backgroundColor: "#fff8e1" } : undefined}
                >
                  <td>{n.id}</td>
                  <td>
                    <div className="fw-bold">{n.title}</div>
                    <div className="text-muted small">{n.address}</div>
                    <div className="text-muted small">{n.landmark}</div>
                  </td>
                  <td>{n.property_type || "-"}</td>
                  <td>{n.property_status === "FOR_SALE" ? "Bán" : n.property_status === "FOR_RENT" ? "Cho Thuê" : n.property_status}</td>
                  <td>
                    {isDraft ? (
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 10px",
                          borderRadius: "20px",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          letterSpacing: "0.5px",
                          background: "linear-gradient(135deg, #ff9800, #ff5722)",
                          color: "#fff",
                          boxShadow: "0 2px 6px rgba(255,152,0,0.45)",
                        }}
                      >
                        ✏️ Draft
                      </span>
                    ) : (
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 10px",
                          borderRadius: "20px",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          letterSpacing: "0.5px",
                          background: "linear-gradient(135deg, #43a047, #1b5e20)",
                          color: "#fff",
                          boxShadow: "0 2px 6px rgba(67,160,71,0.35)",
                        }}
                      >
                        🌐 Public
                      </span>
                    )}
                  </td>
                  <td>{n.price_string || "-"}</td>
                  <td>{n.created_at ? new Date(n.created_at).toLocaleString() : "-"}</td>
                  <td className="d-flex gap-2">
                    <Link className="btn btn-sm btn-gradient" href={`/myproperties/edit-property/${n.id}`}>
                      Edit
                    </Link>
                    <Button className="btn btn-sm btn-danger" onClick={() => onDelete(n.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      {pagination && (
        <Row className="mt-2 align-items-center">
          <Col md="6" className="text-muted">
            Trang {pagination.page} / {pagination.totalPages} — Tổng {pagination.total}
          </Col>
          <Col md="6" className="d-flex justify-content-end gap-2">
            <Button
              className="btn btn-dashed"
              disabled={loading || page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Trang trước
            </Button>
            <Button
              className="btn btn-dashed"
              disabled={loading || page >= (pagination.totalPages || 1)}
              onClick={() => setPage((p) => p + 1)}
            >
              Trang sau
            </Button>
          </Col>
        </Row>
      )}
    </Fragment>
  );
}
