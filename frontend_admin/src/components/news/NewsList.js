"use client";

import Link from "next/link";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Button, Col, Input, Row, Table } from "reactstrap";
import { toast } from "react-toastify";
import { deleteNews, fetchNewsList } from "./newsApi";

const DEFAULT_LIMIT = 20;

export default function NewsList() {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [keyword, setKeyword] = useState("");

  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchNewsList({ page, limit, status: status || undefined, category: category || undefined });
      setRows(res?.data || []);
      setPagination(res?.pagination || null);
    } catch (error) {
      const messageFromApi = error?.response?.data?.message;
      const normalizedMessage = Array.isArray(messageFromApi) ? messageFromApi.join(", ") : messageFromApi;
      toast.error(normalizedMessage || "Không thể tải danh sách bài viết.");
      console.error("NewsList load error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, status, category]);

  const filteredRows = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return rows;
    return rows.filter((n) => {
      const hay = `${n?.title || ""} ${n?.summary || ""} ${n?.slug || ""} ${n?.category || ""}`.toLowerCase();
      return hay.includes(kw);
    });
  }, [rows, keyword]);

  const onDelete = async (id) => {
    if (!confirm("Xóa bài viết này?")) return;
    try {
      await deleteNews(id);
      toast.success("Đã xóa bài viết.");
      load();
    } catch (error) {
      const messageFromApi = error?.response?.data?.message;
      const normalizedMessage = Array.isArray(messageFromApi) ? messageFromApi.join(", ") : messageFromApi;
      toast.error(normalizedMessage || "Không thể xóa bài viết (cần đăng nhập Admin).");
    }
  };

  return (
    <Fragment>
      <Row className="mb-3 align-items-end">
        <Col md="3">
          <label className="form-label">Keyword (search)</label>
          <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Title / slug / category..." />
        </Col>
        <Col md="2">
          <label className="form-label">Status</label>
          <Input
            type="select"
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
          >
            <option value="">All</option>
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
          </Input>
        </Col>
        <Col md="3">
          <label className="form-label">Category (backend filter)</label>
          <Input
            value={category}
            onChange={(e) => {
              setPage(1);
              setCategory(e.target.value);
            }}
            placeholder="VD: market"
          />
        </Col>
        <Col md="2">
          <label className="form-label">Limit</label>
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
            {loading ? "Loading..." : "Reload"}
          </Button>
          <Link className="btn btn-dashed btn-pill" href="/news/add">
            Add
          </Link>
        </Col>
      </Row>

      <div className="table-responsive">
        <Table className="table">
          <thead>
            <tr>
              <th style={{ width: 80 }}>ID</th>
              <th>Title</th>
              <th style={{ width: 140 }}>Status</th>
              <th style={{ width: 160 }}>Category</th>
              <th style={{ width: 90 }}>Views</th>
              <th style={{ width: 180 }}>Published</th>
              <th style={{ width: 220 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={7}>{loading ? "Loading..." : "No data"}</td>
              </tr>
            )}
            {filteredRows.map((n) => (
              <tr key={n.id}>
                <td>{n.id}</td>
                <td>
                  <div className="fw-bold">{n.title}</div>
                  <div className="text-muted small">{n.slug}</div>
                </td>
                <td>{n.status}</td>
                <td>{n.category || "-"}</td>
                <td>{n.views ?? 0}</td>
                <td>{n.published_at ? new Date(n.published_at).toLocaleString() : "-"}</td>
                <td className="d-flex gap-2">
                  <Link className="btn btn-sm btn-gradient" href={`/news/edit/${n.id}`}>
                    Edit
                  </Link>
                  <Button className="btn btn-sm btn-danger" onClick={() => onDelete(n.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {pagination && (
        <Row className="mt-2 align-items-center">
          <Col md="6" className="text-muted">
            Page {pagination.page} / {pagination.totalPages} — Total {pagination.total}
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
              disabled={loading || page >= (pagination.totalPages || 1)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </Col>
        </Row>
      )}
    </Fragment>
  );
}

