import { Container } from "react-bootstrap";
import { Colors } from "../../../assets";
import { UserRoleImg } from "../../../components";
import { getRoleColor } from "../../../utils/functions";

type Props = {
  roles: Array<any>;
  selectRole: Function;
  setMessages: Function;
};

const UserRolesSlide = (props: Props) => {
  const { roles, selectRole, setMessages } = props;

  const handleRoleClick = (index: number) => {
    /*    console.log(`index: ${index}`); */
    selectRole(index);
    setMessages([]);
  };

  return (
    <div>
      <div className="d-flex p-3 border-bottom  " style={{ height: 75 }}>
        <p
          className="fs-3 fw-semibold"
          style={{ color: Colors.orange.primary }}
        >
          User Roles
        </p>
      </div>
      <Container fluid style={{ flex: 1, overflowY: "auto" }} className="p-0">
        {roles &&
          roles.map((item, index) => (
            <div
              key={index}
              className="d-flex flex-row justify-content-start align-items-center border-bottom px-2"
              onClick={() => handleRoleClick(index)}
              role="button"
            >
              <UserRoleImg
                name={item.name}
                color={getRoleColor(index)}
                size={30}
                fontSize={14}
                isRowStyle={true}
                aditionalStyles={{}}
              />
            </div>
          ))}
      </Container>
    </div>
  );
};

export default UserRolesSlide;
