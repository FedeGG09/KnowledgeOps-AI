import {
  Container,
  Navbar,
  Row,
  Col,
  Form,
  Button,
  Spinner,
} from "react-bootstrap";
import Image from "react-bootstrap/esm/Image";
import logo from "../../assets/images/logo_xitrus_bg_transparent.png";
import { Colors } from "../../assets";
import { useMutationRecoveryCode } from "../../utils/hooks";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const {
    mutate: mutateRecoveryCode,
    data: verifyCode,
    isPending,
  } = useMutationRecoveryCode();

  console.log(`
    isPending: ${isPending},
    verifyCode: ${JSON.stringify(verifyCode)},
  `);

  const validateForm = () => {
    let newErrors = "";
    if (!email) {
      newErrors = "Email is required";
    }
    if (!email.includes("@")) {
      newErrors = "Email must be valid";
    }
    setError(newErrors);
    return newErrors === "";
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validate = validateForm();
    if (validate) {
      mutateRecoveryCode({ email: email });
    }
  };

  const handleEnterCode = (e: any) => {
    e.preventDefault();
    navigate("/forgot-password/change-password", {
      state: { email: email },
    });
  };

  return (
    <>
      <Container fluid>
        <Row style={{ height: "100vh" }}>
          <Col xs={4} className="">
            <Container className="d-flex flex-column justify-center w-100 h-100 ">
              <Navbar.Brand href="/">
                <Image
                  className="d-inline-block align-top mx-2"
                  src={logo}
                  fluid
                  style={{ height: 75, width: 75, objectFit: "contain" }}
                />
              </Navbar.Brand>
              <div className="d-flex flex-column justify-content-around h-75">
                <div className="mt-5">
                  <p className="font-size-2vw text-right pt-3 w-75 fw-semibold">
                    Forgot password?
                  </p>

                  <p>No worries, we’ll send you reset instructions.</p>
                </div>
                <Form className="mb-5" onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="email">
                    <Form.Label>Enter your email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="name@example.com"
                      name="email"
                      value={email}
                      isInvalid={!!error}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Form.Control.Feedback type="invalid">
                      {error}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Button
                      variant="btn col-12 fw-medium"
                      style={{
                        background: Colors.orange.primary,
                        color: "#fff",
                      }}
                      type="submit"
                    >
                      Send
                    </Button>
                    <Form.Label
                      onClick={() => {
                        window.location.href = "/login";
                      }}
                      className="my-2 d-flex justify-content-center text-decoration-underline"
                      style={{
                        color: Colors.orange.primary,
                        cursor: "pointer",
                      }}
                    >
                      Back to log in
                    </Form.Label>
                  </Form.Group>
                  {isPending ? (
                    <div className="d-flex justify-content-center">
                      <Spinner animation="border" variant="secondary" />
                    </div>
                  ) : (
                    verifyCode?.message && (
                      <div className="d-flex flex-column align-items-center">
                        <p className="text-danger text-center">
                          {verifyCode?.message}
                        </p>
                        <Button
                          size="sm"
                          className="w-25"
                          variant="success"
                          onClick={handleEnterCode}
                        >
                          Enter Code
                        </Button>
                      </div>
                    )
                  )}
                </Form>
              </div>
            </Container>
          </Col>
          <Col xs={8} className="bg-dark">
            <Container className="d-flex flex-column align-items-center justify-content-center w-100 h-100">
              <Image
                className="d-inline-block align-top mx-5"
                src={logo}
                fluid
                style={{ height: "40%", width: "40%", objectFit: "contain" }}
              />
              <h2
                className="font-size-2vw text-center w-75 fw-semibold"
                style={{ color: Colors.white.primary }}
              >
                Your knowledge base enriched with intelligent conversations.
              </h2>
            </Container>
          </Col>
        </Row>
      </Container>
    </>
  );
};
export default ForgotPassword;
