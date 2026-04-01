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
import logoEmail from "../../assets/icons/email.svg";
import { Colors } from "../../assets";
import { useEffect, useState } from "react";
import { useMutationVerifyUser } from "../../utils/hooks";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

const VerifyUser = () => {
  const location = useLocation();
  const email = location.state.email;
  const [verifyCode, setVerifyCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [response, setResponse] = useState<any>(null);
  const { mutate: verifyUser } = useMutationVerifyUser({ setResponse });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setLoading(true);
    verifyUser({
      email: email,
      verification_code: verifyCode,
    });
  };

  useEffect(() => {
    console.log(`
      email:${email}
      response:${response}
    `);
    if (response) {
      setLoading(false);
      if (response.status === 200) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    }
  }, [response]);

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
                <div className="d-flex flex-column mt-5 align-items-center">
                  <Image
                    className="d-inline-block align-top mx-2"
                    src={logoEmail}
                    fluid
                    style={{
                      height: 120,
                      width: 120,
                      objectFit: "contain",
                    }}
                  />
                  <p className="fs-3 text-center pt-3">
                    Verify your Email Address​​
                  </p>
                  <span className="text-center text-secondary">
                    Enter the code from your email to complete the account
                    verification.
                  </span>
                </div>
                <Form className="mb-5" onSubmit={handleSubmit}>
                  <Form.Group
                    className="mb-3"
                    controlId="exampleForm.ControlInput1"
                  >
                    <Form.Label>Verification Code</Form.Label>
                    <Form.Control
                      value={verifyCode}
                      isInvalid={response?.status !== 200}
                      onChange={(e) => setVerifyCode(e.target.value)}
                    />
                    <Form.Control.Feedback className="text-end" type="invalid">
                      {response?.message}
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
                      {loading ? (
                        <Spinner animation="border" variant="white" />
                      ) : success ? (
                        <FontAwesomeIcon
                          icon={faCheck}
                          size="xl"
                          style={{ color: Colors.white.primary }}
                        />
                      ) : (
                        "Verify"
                      )}
                    </Button>
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
export default VerifyUser;
