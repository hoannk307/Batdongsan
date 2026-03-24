"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button, Col, Form, FormGroup, Input, Label, Row } from "reactstrap";
import { Editor } from "@tinymce/tinymce-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { createNews, updateNews } from "./newsApi";
import { z } from "zod";

const NEWS_STATUSES = ["DRAFT", "PUBLISHED"];

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
  return {
    title: values.title?.trim() || "",
    summary: values.summary?.trim() || undefined,
    content: values.content || "",
    featured_image: values.featured_image?.trim() || undefined,
    category: values.category?.trim() || undefined,
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
    .max(65, "Cảnh báo: Tiêu đề > 65 ký tự có thể bị cắt trên Google"),
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

  const [values, setValues] = useState(() => ({
    title: initialValues?.title || "",
    slug: initialValues?.slug || "",
    summary: initialValues?.summary || "",
    content: initialValues?.content || "",
    featured_image: initialValues?.featured_image || "",
    category: initialValues?.category || "",
    status: initialValues?.status || "DRAFT",
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
      if (mode === "edit") {
        await updateNews(newsId, payload);
        toast.success("Cập nhật bài viết thành công.");
      } else {
        await createNews(payload);
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
            <Input name="category" value={values.category} onChange={onChange} placeholder="VD: market, policy..." />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label>Featured image URL</Label>
            <Input
              name="featured_image"
              value={values.featured_image}
              onChange={onChange}
              placeholder="https://.../image.jpg"
            />
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
                process.env.NEXT_PUBLIC_TINYMCE_SCRIPT_SRC ||
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

