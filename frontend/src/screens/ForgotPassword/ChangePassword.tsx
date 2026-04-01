import React, { useState } from "react";
import {
  Button,
  Col,
  Container,
  Form,
  Image,
  Navbar,
  OverlayTrigger,
  Row,
  Spinner,
  Tooltip,
} from "react-bootstrap";
import { Colors } from "../../assets";
import { ToolTipPassword } from "../../components";
import logo from "../../assets/images/logo_xitrus_bg_transparent.png";
import aboutIcon from "../../assets/icons/about.svg";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { useMutationRecoveryChange } from "../../utils/hooks";

function ChangePassword() {
  const location = useLocation();
  const email = location.state.email;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    mutate: mutateRecoveryChange,
    data,
    isPending,
  } = useMutationRecoveryChange();

  const [form, setForm] = useState({
    recovery_code: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    recovery_code: "",
    password: "",
    confirmPassword: "",
  });

  console.log(`
    email in ChangePassword:${email},
    data: ${JSON.stringify(data)},
  `);

  const { password, confirmPassword, recovery_code } = form;

  const validateForm = () => {
    let newErrors = {
      recovery_code: "",
      password: "",
      confirmPassword: "",
    };
    //Verificar si los campos estan vacios.
    if (!recovery_code) {
      newErrors.recovery_code = "Verification code is required";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required";
    }
    //Verificiar la contraseña
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (password.length < 8)
      newErrors.password = "Password must be at least 8 characters long";
    if (!password.match(/[A-Z]/g))
      newErrors.password =
        "Password must contain at least one uppercase letter";
    if (!password.match(/[0-9]/g))
      newErrors.password = "Password must contain at least one digit";
    if (!password.match(/[#?!@$%^&-']/g))
      newErrors.password =
        "Password must contain at least one special character";

    setErrors(newErrors);

    //Return de la funcion, si hay algun error devuelve false.
    return Object.values(newErrors).every((error) => error === "");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validate = validateForm();
    if (validate) {
      mutateRecoveryChange({
        email: email,
        recovery_code: recovery_code,
        password: password,
      });
    }
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
                    Reset Password
                  </p>

                  <p>Please enter a new password.</p>
                </div>
                <Form className="mb-5" onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="email">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="text"
                      name="email"
                      value={email}
                      disabled
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="verifyCode">
                    <Form.Label>Verification code</Form.Label>
                    <Form.Control
                      type="text"
                      name="recovery_code"
                      value={recovery_code}
                      isInvalid={!!errors.recovery_code}
                      onChange={handleChange}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.recovery_code}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="password">
                    <div className="d-flex justify-content-between">
                      <div className="d-flex flex-row">
                        <Form.Label className="me-3">Password</Form.Label>
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip>
                              <ToolTipPassword />
                            </Tooltip>
                          }
                        >
                          <img
                            src={aboutIcon}
                            alt="About"
                            style={{
                              marginLeft: "2%",
                              cursor: "pointer",
                              height: 20,
                              width: 20,
                              fill: Colors.orange.primary,
                            }}
                          />
                        </OverlayTrigger>
                      </div>
                      <FontAwesomeIcon
                        icon={faEye}
                        style={{
                          color: Colors.orange.primary,
                          marginRight: "2%",
                          cursor: "pointer",
                        }}
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    </div>

                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={password}
                      onChange={handleChange}
                      isInvalid={!!errors.password}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.password}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="ConfirmPassword">
                    <div className="d-flex justify-content-between">
                      <Form.Label>Confirm Password</Form.Label>
                      <FontAwesomeIcon
                        icon={faEye}
                        style={{
                          color: Colors.orange.primary,
                          marginRight: "2%",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      />
                    </div>

                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={handleChange}
                      isInvalid={!!errors.confirmPassword}
                    />

                    <Form.Control.Feedback type="invalid">
                      {errors.confirmPassword}
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
                      Reset password
                    </Button>
                    <Form.Label
                      type="submit"
                      onClick={() => {
                        window.location.href = "/login";
                      }}
                      className="my-2 d-flex justify-content-center text-decoration-underline"
                      style={{ color: Colors.orange.primary }}
                    >
                      Back to log in
                    </Form.Label>
                  </Form.Group>
                  {isPending ? (
                    <div className="d-flex justify-content-center">
                      <Spinner animation="border" variant="secondary" />
                    </div>
                  ) : (
                    data?.message && (
                      <div className="d-flex flex-column align-items-center">
                        <p className="text-danger text-center">
                          {data?.message}
                        </p>
                        {data?.message ===
                          "Password changed. Now you can log in" && (
                          <Button
                            size="sm"
                            className="w-25 my-2"
                            variant="success"
                            onClick={() => {
                              window.location.href = "/login";
                            }}
                          >
                            Log in
                          </Button>
                        )}
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
}

export default ChangePassword;
