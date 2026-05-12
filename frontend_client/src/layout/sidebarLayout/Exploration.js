/**
 * Exploration – form liên hệ tích hợp gửi email.
 * - Lấy địa chỉ email người nhận từ `userData` (chủ bất động sản)
 * - Nội dung email ghép từ inputs (form) + singleData (thông tin BĐS)
 * - Gọi API route /api/mail/send → backend NestJS POST /mail/send
 */
import React, { useState } from "react";
import { Button, Form, FormGroup, Input, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "reactstrap";

const Exploration = ({ userData, singleData }) => {
  const [inputs, setInputs] = useState({ name: "", email: "", mobnumber: "", message: "" });
  const [modal, setModal] = useState(false);
  const [status, setStatus] = useState("idle"); // "idle" | "loading" | "success" | "error"
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Email người nhận lấy từ userData (chủ bất động sản)
    const toEmail = userData?.email;
    if (!toEmail) {
      setErrorMsg("Không tìm thấy email người đăng. Vui lòng thử lại sau.");
      setStatus("error");
      setModal(true);
      return;
    }

    setStatus("loading");
    setModal(true);

    try {
      const res = await fetch("/api/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Người nhận – chủ bất động sản
          toEmail,
          // Thông tin người gửi – từ form
          senderName: inputs.name,
          senderEmail: inputs.email,
          senderPhone: inputs.mobnumber,
          message: inputs.message,
          // Thông tin bất động sản – từ singleData
          propertyTitle: singleData?.title || singleData?.name || "",
          propertyId: singleData?.id ? String(singleData.id) : "",
          propertyAddress: singleData?.address || singleData?.location || "",
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setStatus("error");
        setErrorMsg(data?.error || "Gửi email thất bại. Vui lòng thử lại.");
      } else {
        setStatus("success");
        // Reset form sau khi gửi thành công
        setInputs({ name: "", email: "", mobnumber: "", message: "" });
      }
    } catch {
      setStatus("error");
      setErrorMsg("Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.");
    }
  };

  const handleCloseModal = () => {
    setModal(false);
    if (status !== "loading") {
      setStatus("idle");
      setErrorMsg("");
    }
  };

  return (
    <div className="advance-card">
      <h6>Liên hệ</h6>
      <div className="category-property">
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Input
              type="text"
              className="form-control"
              placeholder="Họ tên"
              required
              name="name"
              value={inputs.name}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup className="form-group">
            <Input
              type="email"
              className="form-control"
              placeholder="Email của bạn"
              required
              name="email"
              value={inputs.email}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup className="form-group">
            <Input
              placeholder="Số điện thoại"
              className="form-control"
              name="mobnumber"
              required
              value={inputs.mobnumber || ""}
              onChange={(e) => {
                e.target.value.length <= 10 && handleChange(e);
              }}
            />
          </FormGroup>
          <FormGroup>
            <Input
              type="textarea"
              placeholder="Nội dung tin nhắn..."
              className="form-control"
              rows="3"
              name="message"
              value={inputs.message}
              onChange={handleChange}
            />
          </FormGroup>
          <Button
            type="submit"
            className="btn btn-gradient btn-block btn-pill"
            disabled={!userData?.email}
          >
            {!userData?.email ? "Không có email người đăng" : "Gửi liên hệ"}
          </Button>
        </Form>
      </div>

      {/* Modal trạng thái gửi email */}
      <Modal isOpen={modal} toggle={handleCloseModal}>
        <ModalHeader toggle={handleCloseModal}>
          <strong>
            {status === "loading" && "Đang gửi email..."}
            {status === "success" && "✅ Gửi thành công!"}
            {status === "error" && "❌ Gửi thất bại"}
          </strong>
        </ModalHeader>
        <ModalBody>
          {status === "loading" && (
            <div className="text-center py-3">
              <Spinner color="primary" />
              <p className="mt-3 mb-0 text-muted">Đang gửi email đến người đăng, vui lòng chờ...</p>
            </div>
          )}
          {status === "success" && (
            <div className="text-center py-2">
              <p style={{ fontSize: "48px", margin: 0 }}>🎉</p>
              <p className="mt-2 mb-1 fw-semibold">Email đã được gửi thành công!</p>
              <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
                Người đăng sẽ liên hệ lại với bạn qua email hoặc số điện thoại sớm nhất có thể.
              </p>
            </div>
          )}
          {status === "error" && (
            <div className="text-center py-2">
              <p style={{ fontSize: "48px", margin: 0 }}>⚠️</p>
              <p className="mt-2 mb-1 fw-semibold">Không thể gửi email</p>
              <p className="text-muted mb-0" style={{ fontSize: "14px" }}>{errorMsg}</p>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          {status !== "loading" && (
            <Button
              color={status === "success" ? "success" : "secondary"}
              onClick={handleCloseModal}
            >
              {status === "success" ? "Đóng" : "Thử lại"}
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default Exploration;
