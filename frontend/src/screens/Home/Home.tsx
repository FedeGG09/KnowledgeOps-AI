import { Button, Container } from "react-bootstrap";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import chatView from "../../assets/images/viewChat.png";

function Home() {
  return (
    <Container className="container-xl">
      <Row className="">
        <Col
          xs={6}
          className="justify-content-around d-flex flex-column"
          style={{ minHeight: "70vh" }}
        >
          <div>
            <h1 className="fw-semibold" style={{ fontSize: 50 }}>
              Turning your data into conversations, scaling information into
              knowledge insights with AI
            </h1>
            <p className="text-secondary fw-normal">
              Connect to your data sources, upload documents, choose your role
              and unleash knowledge at scale!
            </p>
          </div>
          <Button
            href="/signup"
            className="btn btn-xl w-25"
            style={{
              borderRadius: "10px",
              background: `linear-gradient(90deg, #00173D, #0082FC)`,
              backgroundBlendMode: "darken",
              borderWidth: 0,
            }}
          >
            Get Started
          </Button>
        </Col>
        <Col xs={6}>
          <div style={{ width: "100vh" }}>
            <img
              src={chatView}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Home;
