const ToolTipPassword = () => {
  return (
    <ul className="list my-2">
      <li style={{ fontSize: 12, textAlign: "start" }}>
        Must have a minimum length of 8 characters
      </li>
      <li style={{ fontSize: 12, textAlign: "start" }}>
        At least one uppercase letter
      </li>
      <li style={{ fontSize: 12, textAlign: "start" }}>At least one number</li>
      <li style={{ fontSize: 12, textAlign: "start" }}>
        At least one special character #?!@$%^&-'
      </li>
    </ul>
  );
};

export default ToolTipPassword;
