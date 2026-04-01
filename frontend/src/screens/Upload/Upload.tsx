import { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import { UserRoleImg } from "../../components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX, faCircleCheck, faTrash } from "@fortawesome/free-solid-svg-icons";
/* import userDefault from "../../assets/icons/UserDefault.svg"; */
import "./styles.css";
import { Link } from "react-router-dom";
import CustomDropzone from "./components/CustomDropzone";
import pdfIcon from "../../assets/icons/pdfIcon.svg";
import { Colors } from "../../assets";
import { useDispatch, useSelector } from "react-redux";
import {
  useAllRoles,
  useMutationCreateRole,
  useMutationDeleteRole,
  useViewFiles,
  useMutationDeleteFile,
} from "../../utils/hooks";
import { setRoles } from "../../redux/roles/rolesSlice";
import {
  getRoleColor,
  refactorDoubleQuotes,
  isValidInput,
} from "../../utils/functions";
import { Modal, Button, Spinner } from "react-bootstrap";

interface IDeleteRole {
  idRole: number;
  state: boolean;
}

const Upload = () => {
  const { data: allRoles } = useAllRoles();
  const dispatch = useDispatch();
  const roles = useSelector((state: any) => state.roles);
  /*   const user = useSelector((state: any) => state.user); */
  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [deletingFile, setDeletingFile] = useState("");
  const { data: viewFiles } = useViewFiles();
  const [isVisible, setIsVisible] = useState(false);
  const [idRole, setIdRole] = useState(0);
  const [validateError, setValidateError] = useState(false);
  const { mutate: mutateDeleteRole } = useMutationDeleteRole();
  const { mutate: mutateCreateRole } = useMutationCreateRole();
  const handleFinishDeleteFile = () => {
    setLoadingDelete(false);
    setDeletingFile("");
  };
  const { mutate: mutateDeleteFile } = useMutationDeleteFile({
    handleFinishDeleteFile,
  });
  const handleModal = (state: boolean) => {
    setIsVisible(state);
  };

  const handleDeleteRole = ({ idRole, state }: IDeleteRole) => {
    handleModal(state);
    setIdRole(idRole);
  };

  const handlePostDeleteRole = ({ idRole, state }: IDeleteRole) => {
    mutateDeleteRole({ idRole: idRole });
    handleModal(state);
  };

  useEffect(() => {
    if (allRoles && allRoles.message.length > 0) {
      dispatch(setRoles(allRoles.message));
    }
  }, [allRoles]);

  const removeFile = (fileName: string) => {
    setDeletingFile(fileName);
    setLoadingDelete(true);
    mutateDeleteFile(fileName);
  };

  const handlePostNewRole = (e: any) => {
    e.preventDefault();
    if (isValidInput(name) && isValidInput(description)) {
      const refactoredName = refactorDoubleQuotes(name);
      const refactoredDescription = refactorDoubleQuotes(description);
      console.log(`refactoredDescription:${refactoredDescription}`);
      mutateCreateRole({
        name: refactoredName,
        description: refactoredDescription,
      });
      setName("");
      setDescription("");
      setValidateError(false);
    } else {
      console.log("invalid input");
      setValidateError(true);
    }
  };

  return (
    <div className="container">
      <div className="row ">
        <div className="col text-center">
          <h3 className="text-center my-4 ">Upload file</h3>
          <CustomDropzone
            setFiles={setFiles}
            files={files}
            loading={loading}
            setLoading={setLoading}
          />
          <ul className="list-group my-2">
            {viewFiles &&
              viewFiles.archivos.map((file: any, index: number) => (
                <li className="list-group-item " key={index}>
                  <div className="d-flex flex-row align-items-center justify-content-between w-100 p-0">
                    <div className="d-flex flex-row- align-items-center">
                      <FontAwesomeIcon
                        icon={faCircleCheck}
                        color={Colors.green.primary}
                      />
                      <img
                        className="mx-2"
                        src={pdfIcon}
                        style={{
                          width: 20,
                          height: 20,
                          objectFit: "contain",
                        }}
                      />
                      <div>{file}</div>
                    </div>
                    {loadingDelete && deletingFile === file ? (
                      <Spinner animation="border" variant="danger" />
                    ) : (
                      <div onClick={() => removeFile(file)} role="button">
                        <FontAwesomeIcon icon={faTrash} color="red" />
                      </div>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        </div>
        <div className="d-flex flex-column mb-3 col align-items-center">
          <div className="w-100 text-center py-3">
            <span className="fs-4 fw-medium">
              Please outline the roles, with a maximum of 4.
            </span>
          </div>
          <div className="d-flex flex-row align-items-center w-100 px-2 ">
            {roles &&
              roles.map((item: any, index: number) => (
                <div
                  key={index}
                  className="w-100"
                  style={{ position: "relative" }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: -10,
                      right: 20,
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      handleDeleteRole({
                        idRole: item.idrol,
                        state: true,
                      })
                    }
                  >
                    <FontAwesomeIcon icon={faX} color="red" size="sm" />
                  </div>
                  <UserRoleImg
                    name={item.name}
                    color={getRoleColor(index)}
                    size={50}
                    fontSize={14}
                  />
                </div>
              ))}
          </div>
          <Form
            className="container bg-light align-items-center border rounded-1 b p-4"
            onSubmit={handlePostNewRole}
          >
            <Form.Group className="mb-3" controlId="formSelectName">
              <div className="d-flex  justify-content-between align-items-center">
                <Form.Label>Name</Form.Label>
                <Form.Label className="my-2">
                  {validateError && (
                    <span className="text-danger">
                      *Name and description cannot be empty
                    </span>
                  )}
                </Form.Label>
              </div>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formSelectDescription">
              <Form.Label className="w-100">
                <div className="d-flex justify-content-between">
                  <div>Description</div>
                  <div className="text-muted fs-6">
                    Enter a description for the desired role.
                  </div>
                </div>
              </Form.Label>
              <Form.Control
                as="textarea"
                placeholder="Leave a description here"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ height: "100px" }}
              />
            </Form.Group>

            <div className="d-grid">
              <Button variant="primary" type="submit" className="btn-sm">
                Add role +
              </Button>
            </div>
          </Form>
        </div>
        <div className="d-flex justify-content-end mb-3 m-1">
          <Link to="/chat">
            <Button variant="primary" type="submit" className="btn-sm">
              Go to Chat
            </Button>
          </Link>
        </div>
      </div>
      <Modal
        show={isVisible}
        onHide={() =>
          handleDeleteRole({
            idRole: 0,
            state: false,
          })
        }
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure to delete the following role?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() =>
              handleDeleteRole({
                idRole: 0,
                state: false,
              })
            }
          >
            Close
          </Button>
          <Button
            variant="danger"
            onClick={() =>
              handlePostDeleteRole({
                idRole: idRole,
                state: false,
              })
            }
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Upload;
