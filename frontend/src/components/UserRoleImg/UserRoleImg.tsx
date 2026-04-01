import Figure from "react-bootstrap/Figure";
import { UserIcon } from "../../utils/functions";

type Props = {
  name?: string;
  color: string;
  size: number;
  fontSize?: number;
  isRowStyle?: boolean;
  aditionalStyles?: object;
};

const UserRoleImg = (props: Props) => {
  const { name, color, size, isRowStyle, fontSize, aditionalStyles } = props;

  return (
    <Figure
      className={
        isRowStyle
          ? "d-flex flex-row align-items-center justify-content-center mx-2 my-2"
          : "d-flex flex-column align-items-center mx-1 justify-content-center px-2 w-100 h-100"
      }
      style={{ ...aditionalStyles }}
    >
      <div
        style={{
          alignItems: "center",
        }}
      >
        <UserIcon fill={color} size={size} />
      </div>
      {name && (
        <Figure.Caption className="text-wrap w-100 text-center my-1 mx-2">
          <span style={{ fontSize: fontSize }}>{name}</span>
        </Figure.Caption>
      )}
    </Figure>
  );
};

export default UserRoleImg;
