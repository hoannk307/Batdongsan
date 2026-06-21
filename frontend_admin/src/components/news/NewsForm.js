"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button, Col, Form, FormGroup, Input, Label, Row } from "reactstrap";
import { Editor } from "@tinymce/tinymce-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import DropZones from "@/components/Common/Dropzones";
import { z } from "zod";
import { TINYMCE_SCRIPT_SRC } from "@/config/env";
import axios from "axios";

const NEWS_STATUSES = ["DRAFT", "PUBLISHED"];

function getAuthHeaders() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token") || (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}")?.token; } catch { return null; }
  })();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function generateSlug(title) {
  return (title || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizePayload(values, isManualSlug) {
  const slugTrimmed = values.slug?.trim() || "";
  const slugForPayload = isManualSlug ? slugTrimmed : slugTrimmed || generateSlug(values.title);

  const parsedTags = String(values.tagsText || "")
    .split(/[;,]/g)
    .map((t) => t.trim())
    .filter(Boolean);

  return {
    title: values.title?.trim() || "",
    summary: values.summary?.trim() || undefined,
    content: values.content || "",
    featured_image: values.featured_image?.trim() || undefined,
    category: values.category != null && values.category !== "" ? Number(values.category) : undefined,
    tags: Array.from(new Set(parsedTags)),
    // Backend schema requires slug.
    // - Nếu user tự sửa slug (`isManualSlug`) thì payload dùng đúng slug user nhập.
    // - Nếu user chưa tự sửa thì tự generate từ title.
    slug: slugForPayload,
    status: values.status || "DRAFT",
  };
}

// 1. Cấu hình Validate chuẩn SEO với Zod
const newsSchema = z.object({
  title: z
    .string()
    .min(10, "Tiêu đề quá ngắn")
    .max(200, "Tiêu đề không được dài quá 200 ký tự"),
  slug: z.string().min(1, "Slug không được để trống"),
  summary: z
    .string()
    .max(160, "Cảnh báo: Mô tả > 160 ký tự sẽ bị ẩn bớt trên kết quả tìm kiếm"),
  content: z.string().min(50, "Nội dung không được để trống"),
});

export default function NewsForm({ mode, initialValues, newsId, tinymceApiKey: tinymceApiKeyProp }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [resolvedTinymceApiKey, setResolvedTinymceApiKey] = useState(tinymceApiKeyProp || "");
  const [loadingTinymceKey, setLoadingTinymceKey] = useState(false);
  const [isManualSlug, setIsManualSlug] = useState(false);
  const [categories, setCategories] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  // Ảnh đại diện hiện tại (khi edit)
  const [existingImagePath, setExistingImagePath] = useState(
    mode === "edit" ? (initialValues?.img || initialValues?.file_attach?.[0]?.path || "") : ""
  );

  useEffect(() => {
    // Nếu server chưa truyền prop key (undefined/empty) thì fetch từ API server.
    if (tinymceApiKeyProp) return;
    if (!resolvedTinymceApiKey) {
      setLoadingTinymceKey(true);
      fetch("/api/tinymce-key")
        .then((r) => r.json())
        .then((data) => {
          setResolvedTinymceApiKey(data?.key || "");
        })
        .catch(() => setResolvedTinymceApiKey(""))
        .finally(() => setLoadingTinymceKey(false));
    }
  }, [tinymceApiKeyProp, resolvedTinymceApiKey]);

  // Fetch danh sách danh mục tin tức
  useEffect(() => {
    fetch("/api/news/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch((err) => console.error("Failed to fetch news categories", err));
  }, []);

  const [values, setValues] = useState(() => ({
    title: initialValues?.title || "",
    slug: initialValues?.slug || "",
    summary: initialValues?.summary || "",
    content: initialValues?.content || "",
    featured_image: initialValues?.featured_image || "",
    category: initialValues?.category || "",
    status: initialValues?.status || "DRAFT",
    tagsText: Array.isArray(initialValues?.tags)
      ? initialValues.tags.map((t) => t?.name || t).filter(Boolean).join(", ")
      : "",
  }));

  // Tự động tạo slug khi người dùng gõ Title (nếu chưa tự sửa Slug).
  useEffect(() => {
    if (!isManualSlug && values?.title) {
      setValues((prev) => ({
        ...prev,
        slug: generateSlug(prev.title),
      }));
    }
  }, [values.title, isManualSlug]);

  const canSubmit = useMemo(() => {
    return Boolean(values.title?.trim()) && Boolean(values.content);
  }, [values.title, values.content]);

  if (!resolvedTinymceApiKey) {
    if (loadingTinymceKey) {
      return <div className="alert alert-info">Loading TinyMCE API key...</div>;
    }
    return (
      <div className="alert alert-warning" role="alert">
        TinyMCE missing API key. Please set <code>NEXT_PUBLIC_TINYMCE_API_KEY</code> in{" "}
        <code>frontend_admin/.env.local</code>.
        <div style={{ marginTop: 8 }}>
          Resolved key length: <b>{resolvedTinymceApiKey?.length ?? 0}</b>
        </div>
      </div>
    );
  }

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === "slug") {
      setIsManualSlug(true);
    }
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const onContentChange = (nextHtml) => {
    setValues((prev) => ({ ...prev, content: nextHtml }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error("Vui lòng nhập Title và Content.");
      return;
    }

    const slugTrimmed = values.slug?.trim() || "";
    const slugForValidation = isManualSlug ? slugTrimmed : slugTrimmed || generateSlug(values.title);
    const summaryForValidation = values.summary || "";
    const contentForValidation = values.content || "";

    const validation = newsSchema.safeParse({
      title: values.title || "",
      slug: slugForValidation,
      summary: summaryForValidation,
      content: contentForValidation,
    });

    if (!validation.success) {
      toast.error(validation.error.issues[0]?.message || "Dữ liệu không hợp lệ.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = normalizePayload(values, isManualSlug);
      const headers = getAuthHeaders();

      if (mode === "edit") {
        if (uploadedFiles.length > 0) {
          // Có ảnh mới: gọi PATCH with-files để xóa ảnh cũ trên R2 + file_attach, upload ảnh mới
          const formData = new FormData();
          Object.entries(payload).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              if (Array.isArray(value)) {
                formData.append(key, JSON.stringify(value));
              } else {
                formData.append(key, value);
              }
            }
          });
          uploadedFiles.forEach((file) => formData.append("files", file));
          await axios.patch(`/api/news/${newsId}/with-files`, formData, { headers });
        } else {
          // Không đổi ảnh: update JSON thông thường
          await axios.patch(`/api/news/${newsId}`, payload, { headers });
        }
        toast.success("Cập nhật bài viết thành công.");
      } else if (uploadedFiles.length > 0) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            if (Array.isArray(value)) {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, value);
            }
          }
        });
        uploadedFiles.forEach((file) => formData.append("files", file));
        await axios.post(`/api/news/with-files`, formData, { headers });
        toast.success("Tạo bài viết thành công.");
      } else {
        await axios.post(`/api/news`, payload, { headers });
        toast.success("Tạo bài viết thành công.");
      }
      router.push("/news/list");
    } catch (error) {
      const messageFromApi = error?.response?.data?.message;
      const normalizedMessage = Array.isArray(messageFromApi) ? messageFromApi.join(", ") : messageFromApi;
      toast.error(normalizedMessage || "Không thể lưu bài viết.");
      console.error("NewsForm error", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form onSubmit={onSubmit}>
      <Row>
        <Col md="8">
          <FormGroup>
            <Label>Title *</Label>
            <Input name="title" value={values.title} onChange={onChange} placeholder="Nhập tiêu đề..." />
            {values.title.length > 65 && (
              <small className="text-warning">
                Gợi ý SEO: Tiêu đề dài hơn 65-70 ký tự có thể bị Google cắt bớt khi hiển thị.
              </small>
            )}
          </FormGroup>
        </Col>
        <Col md="4">
          <FormGroup>
            <Label>Status</Label>
            <Input type="select" name="status" value={values.status} onChange={onChange}>
              {NEWS_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Input>
          </FormGroup>
        </Col>
        <Col md="12">
          <FormGroup>
            <Label>Slug</Label>
            <Input
              name="slug"
              value={values.slug}
              onChange={onChange}
              placeholder="vd: thi-truong-bat-dong-san-2024"
            />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label>Category</Label>
            <Input type="select" name="category" value={values.category} onChange={onChange}>
              <option value="">-- Chọn danh mục --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Input>
          </FormGroup>
        </Col>
        <Col md="12">
          <FormGroup>
            <Label>Tags (comma separated)</Label>
            <Input
              type="textarea"
              rows="2"
              name="tagsText"
              value={values.tagsText}
              onChange={onChange}
              placeholder="vd: market, policy, real-estate"
            />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label>Ảnh đại diện (Featured Image)</Label>
            {/* Hiển thị ảnh hiện tại khi edit và chưa chọn ảnh mới */}
            {mode === "edit" && existingImagePath && uploadedFiles.length === 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={existingImagePath}
                    alt="Ảnh đại diện hiện tại"
                    style={{
                      maxWidth: 260,
                      maxHeight: 160,
                      objectFit: "cover",
                      borderRadius: 8,
                      border: "1px solid #dee2e6",
                      display: "block",
                    }}
                  />
                  <button
                    type="button"
                    title="Thay ảnh mới"
                    onClick={() => setExistingImagePath("")}
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      background: "rgba(220,53,69,0.85)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "50%",
                      width: 26,
                      height: 26,
                      cursor: "pointer",
                      fontSize: 14,
                      lineHeight: "26px",
                      textAlign: "center",
                      padding: 0,
                    }}
                  >
                    ✕
                  </button>
                </div>
                <small className="text-muted d-block mt-1">Nhấn ✕ để chọn ảnh mới</small>
              </div>
            )}
            {/* Dropzone: hiển thị khi chưa có ảnh hoặc đang thay ảnh */}
            {(uploadedFiles.length > 0 || !existingImagePath || mode !== "edit") && (
              <div className="dropzone" id="newsImageUpload">
                <div className="dz-message needsclick">
                  <DropZones multiple={false} files={uploadedFiles} onFilesChange={setUploadedFiles} />
                </div>
              </div>
            )}
          </FormGroup>
        </Col>
        <Col md="12">
          <FormGroup>
            <Label>Summary</Label>
            <Input type="textarea" rows="3" name="summary" value={values.summary} onChange={onChange} />
          </FormGroup>
        </Col>
        <Col md="12">
          <FormGroup>
            <Label>Content *</Label>
            <Editor
              apiKey={resolvedTinymceApiKey}
              tinymceScriptSrc={
                TINYMCE_SCRIPT_SRC ||
                `https://cdn.tiny.cloud/1/${resolvedTinymceApiKey}/tinymce/6/tinymce.min.js`
              }
              value={values.content}
              onEditorChange={onContentChange}
              init={{
                height: 420,
                menubar: true,
                plugins: [
                  "advlist",
                  "autolink",
                  "lists",
                  "link",
                  "image",
                  "charmap",
                  "preview",
                  "anchor",
                  "searchreplace",
                  "visualblocks",
                  "code",
                  "fullscreen",
                  "insertdatetime",
                  "media",
                  "table",
                  "help",
                  "wordcount",
                ],
                toolbar:
                  "undo redo | blocks | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media table | removeformat | code fullscreen | help",
                content_style:
                  "body { font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,'Apple Color Emoji','Segoe UI Emoji'; font-size: 14px; }",
              }}
            />
          </FormGroup>
        </Col>
        <Col md="12" className="d-flex gap-2">
          <Button color="primary" className="btn btn-gradient btn-pill" disabled={submitting || !canSubmit} type="submit">
            {submitting ? "Saving..." : mode === "edit" ? "Update" : "Create"}
          </Button>
          <Button
            type="button"
            className="btn btn-dashed btn-pill"
            disabled={submitting}
            onClick={() => router.push("/news/list")}
          >
            Cancel
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

