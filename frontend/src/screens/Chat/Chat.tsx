import { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Colors } from "../../assets";
import UserRolesSlide from "./components/UserRolesSlide";
import ChatView from "./components/ChatView";
import { useAllRoles } from "../../utils/hooks";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setRoles } from "../../redux/roles/rolesSlice";
import { useQueryClient } from "@tanstack/react-query";
import https from "../../utils/https";

const Chat = () => {
  /*   const [roles, setRoles] = useState([]); */
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(null);
  const dispatch = useDispatch();
  const roles = useSelector((state: any) => state.roles);
  const [msg, setMessages] = useState([]);
  const queryClient = useQueryClient();
  const { data: allRoles } = useAllRoles();
  const selectedRole = roles.find(
    (role: any, index: number) => role && index === selectedRoleIndex
  );

  console.log(`
    message:${JSON.stringify(msg)}
    roles:${JSON.stringify(roles)}g

    selectedRoleIndex:${selectedRoleIndex}
  `);

  const handleNewMessage = (newData: any) => {
    setMessages(newData.messages);
  };

  useEffect(() => {
    if (allRoles && allRoles.message.length > 0) {
      dispatch(setRoles(allRoles.message));
    }
  }, [allRoles]);

  useEffect(() => {
    if (selectedRoleIndex !== null) {
      setMessages([]);

      queryClient
        .fetchQuery({
          queryKey: ["messages", selectedRole?.idrol],
          queryFn: () => https.getMessagesByRol(selectedRole?.idrol),
        })
        .then((messages: any) => {
          if (messages && messages.message.length > 0) {
            setMessages(messages.message);
          }
        });
    }
  }, [selectedRoleIndex]);

  return (
    <Container>
      <Row>
        <Col xs={3} className="border p-0">
          <UserRolesSlide
            roles={roles}
            selectRole={setSelectedRoleIndex}
            setMessages={setMessages}
          />
        </Col>
        <Col
          xs={9}
          className="border p-0"
          style={{ backgroundColor: Colors.orange.secondary }}
        >
          <ChatView
            setMessages={setMessages}
            message={msg}
            selectedRole={selectedRole}
            rolIndex={selectedRoleIndex}
            handleNewMessage={handleNewMessage}
          />
        </Col>
      </Row>
    </Container>
  );
};
export default Chat;
