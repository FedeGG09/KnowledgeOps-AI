import UserRoleImg from "../../../components/UserRoleImg/UserRoleImg";
import { getRoleColor } from "../../../utils/functions";

type Props = {
  isResponse: boolean;
  message?: string;
  rolIndex?: number;
};

const MessageCard = (props: Props) => {
  const { isResponse, message, rolIndex } = props;

  return (
    <div
      className={
        isResponse
          ? "container my-3 bg-white py-3 rounded shadow-sm"
          : "container my-3"
      }
    >
      <div
        className={
          isResponse
            ? "d-flex flex-row w-100 align-items-start justify-content-between"
            : "d-flex flex-row w-100 align-items-start"
        }
      >
        <UserRoleImg
          color={isResponse ? getRoleColor(rolIndex ? rolIndex : -1) : "black"}
          size={30}
          isRowStyle={true}
        />
        {/*  <img
          src={userDefault}
          style={{ width: 30, height: 30, objectFit: "contain" }}
        /> */}
        <span className={"mx-3"}>{message}</span>
      </div>
    </div>
  );
};

export default MessageCard;
