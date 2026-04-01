import Container from "react-bootstrap/Container";
import { Outlet } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Navbar from "react-bootstrap/Navbar";
import Image from "react-bootstrap/esm/Image";
import Dropdown from "react-bootstrap/Dropdown";
import img from "../../assets/images/xitrus_bg_transparent.png";
import imgb from "../../assets/images/LOGO_BESALCO.png";
import { useSelector } from "react-redux";
import userImg from "../../assets/icons/UserDefault.svg";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/user/userSlice";
import { useNavigate } from "react-router-dom";

function Header() {
  const user = useSelector((state: any) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <>
      <Navbar>
        <Container>
          <Navbar.Brand href="/">
            <Image
              src={img}
              fluid
              style={{ height: 150, width: 150, objectFit: "contain" }}
            />
          </Navbar.Brand>
          <Navbar.Brand href="/">
            <Image
              src={imgb}
              fluid
              style={{ height: 150, width: 150, objectFit: "contain" }}
            />
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="px-3 justify-content-end">
            {user && user.token !== "" ? (
              <Dropdown>
                <Dropdown.Toggle
                  variant="secondary"
                  id="dropdown-basic"
                  size="sm"
                  className="fw-semibold d-flex flex-row align-items-center"
                >
                  <div className="d-flex flex-row align-items-center justify-content-center ">
                    <img
                      src={userImg}
                      style={{
                        width: "25px",
                        height: "25px",
                        objectFit: "contain",
                      }}
                    />
                    <span className="mx-2">{user.name}</span>
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                  <Dropdown.Item href="/chat">Chat</Dropdown.Item>
                  <Dropdown.Item href="/upload">Upload file</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <>
                {/* <Button
                  href="/signup"
                  style={{
                    borderRadius: "10px",
                    background: `linear-gradient(90deg, #00173D, #0082FC)`,
                    backgroundBlendMode: "darken",
                    borderWidth: 0,
                  }}
                >
                  Sign Up
                </Button> */}

                {/* <Button
                  href="/login"
                  variant="outline-warning mx-3 fw-semibold"
                  style={{ backgroundColor: '#0082FC', borderColor: '#00173D', color: '#ffffff'}}
                >
                  Log In
                </Button> */}
                <Button
                  href="/login"
                  variant="outline-primary mx-3 fw-semibold"
                >
                  Log In
                </Button>
              </>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Outlet />
    </>
  );
}

export default Header;
