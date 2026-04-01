import { Container, Navbar, Row, Col, Form, Button } from "react-bootstrap";
import Image from "react-bootstrap/esm/Image";
import logo from "../../assets/images/logo_xitrus_bg_transparent.png";
import { Colors } from "../../assets";
import http from "../../utils/https";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/user/userSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

const LogIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const dispatch = useDispatch();
  const [response, setResponse] = useState<any>(null);
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    console.log(`
      handleSubmit:{
        email: ${email}
        password: ${password}
      }
    `);
    try {
      const res = await http.login({ email, password });
      console.log(`
        res.handleSubmit: ${res}`);
      if (res && res.token) {
        dispatch(setUser(res));
        window.location.href = "/upload";
      } else if (res && res.response) {
        setResponse(res.response.data.detail);
      }
    } catch (error) {
      console.log(error);
    }
  };

  console.log("response", response);

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
                  <p className="fs-3 text-center pt-3">Welcome back ​​👋​​</p>
                </div>
                <Form className="mb-5" onSubmit={handleSubmit}>
                  <Form.Group
                    className="mb-3"
                    controlId="exampleForm.ControlInput1"
                  >
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group
                    className="mb-3"
                    controlId="exampleForm.ControlTextarea1"
                  >
                    <div className="d-flex justify-content-between">
                      <Form.Label>Password</Form.Label>
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Form.Group>
                  {response && (
                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                      <Form.Text className="text-danger">*{response}</Form.Text>
                    </Form.Group>
                  )}
                  <Form.Group className="mb-3">
                    <Form.Label
                      type="button"
                      onClick={() =>
                        (window.location.href = "/forgot-password")
                      }
                      className="d-flex justify-content-end"
                      style={{ color: Colors.orange.primary }}
                    >
                      Forgot Password
                    </Form.Label>
                    <Button
                      variant="btn col-12 fw-medium"
                      style={{
                        background: Colors.orange.primary,
                        color: "#fff",
                      }}
                      type="submit"
                    >
                      Log In
                    </Button>
                    {/* <Form.Label className="mt-2">
                      Don’t have an account yet?{" "}
                      <Form.Label
                        onClick={() => {
                          window.location.href = "/signup";
                        }}
                        type="button"
                        style={{ color: Colors.orange.primary }}
                      >
                        Sing up
                      </Form.Label>{" "}
                      here
                    </Form.Label> */}
                  </Form.Group>
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
export default LogIn;
