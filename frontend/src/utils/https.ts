import axios from "../utils/axiosConfig";
import {
  IMainGet,
  IMainPost,
  ISendMessages,
  ICreateRole,
  IDeletedRole,
  ISignUp,
  IVerifyUser,
  IPWDRecoveryCode,
  IPWDRecoveryChange,
} from "./types";

/* const user = useSelector((state: any) => state.user);
 */
const apiURL = import.meta.env.VITE_BASE_URL;

/* function getFormData(object: []) {
  const formData = new FormData();
  Object.keys(object).forEach((key: any) => formData.append(key, object[key]));
  return formData;
}
 */
async function login(data: any) {
  const headers = {
    Accept: "application/json",
    ContentType: "application/json",
  };

  try {
    const urlComplete = `${apiURL}login`;
    const response = await axios.post(urlComplete, data, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.log(error);
    return error;
  }
}

async function mainGet(props: IMainGet) {
  const { apiURL, method } = props;

  try {
    const urlComplete = `${apiURL}${method}`;

    const response = await axios.get(urlComplete);
    return response.data;
  } catch (error) {
    console.log(error);
    return error;
  }
}

async function mainPost(props: IMainPost) {
  const { apiURL, method, data } = props;

  try {
    const urlComplete = `${apiURL}${method}`;

    const response = await axios.post(urlComplete, data);
    console.log(`
    mainPost Data: ${JSON.stringify(data)}`);
    // Verifica el estado de la respuesta
    if (response.status >= 200 && response.status < 300) {
      // Si el estado es 2xx, devuelve los datos de la respuesta
      return response.data;
    } else {
      // Si el estado no es 2xx, lanza un error
      throw new Error(`Request failed with status code ${response.status}`);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Si el error es un error de Axios, devuelve los datos de error del servidor
      return error.response?.data;
    } else {
      // Si el error es un error de JavaScript, devuelve el mensaje de error
      return { message: error };
    }
  }
}

/* async function mainDelete(props: IMainPost) {
  const { apiURL, method, data } = props;

  try {
    const urlComplete = `${apiURL}${method}`;
    console.log(`
    maindDelete Data: ${JSON.stringify(data)}
      `);
    const response = await axios.delete(urlComplete, data);
    return response.data;
  } catch (error) {
    console.log(error);
    return error;
  }
} */

function signUp(props: ISignUp) {
  const { name, lastName, email, password } = props;
  return mainPost({
    apiURL,
    method: "sign_up",
    data: {
      name: name,
      lastname: lastName,
      email: email,
      password: password,
    },
  });
}

function verifyUser(props: IVerifyUser) {
  const { email, verification_code } = props;
  return mainPost({
    apiURL,
    method: "sign_up/verify_user",
    data: {
      email: email,
      verification_code: verification_code,
    },
  });
}

function getMessagesByRol(rol: number) {
  return mainPost({
    apiURL,
    method: "chat/getByUsuarioByRol",
    data: { rol: rol },
  });
}

function getAllRoles() {
  return mainGet({ apiURL, method: "roles/getAllRoles" });
}

function sendMessages({ query, rol }: ISendMessages) {
  return mainPost({
    apiURL,
    method: "chat",
    data: {
      query: query,
      rol: rol,
    },
  });
}

function passwordRecovery({ email }: IPWDRecoveryCode) {
  return mainPost({
    apiURL,
    method: "pwdrecovery/get_code",
    data: {
      email: email,
    },
  });
}

function passwordRecoveryChange({
  email,
  recovery_code,
  password,
}: IPWDRecoveryChange) {
  return mainPost({
    apiURL,
    method: "pwdrecovery/change",
    data: {
      email: email,
      recovery_code: recovery_code,
      password: password,
    },
  });
}

function createRole({ name, description }: ICreateRole) {
  return mainPost({
    apiURL,
    method: "roles/update",
    data: {
      id: 0,
      name: name,
      description: description,
    },
  });
}

function uploadFile(data: any) {
  return mainPost({
    apiURL,
    method: "files/upload",
    data: data,
  });
}

function deletedRole({ idRole }: IDeletedRole) {
  return mainPost({
    apiURL,
    method: "roles/delete",
    data: {
      id: idRole,
    },
  });
}

function getFiles() {
  return mainGet({ apiURL, method: "files/view" });
}

function deleteFile(fileName: string) {
  return mainPost({
    apiURL,
    method: "files/delete",
    data: {
      filename: fileName,
    },
  });
}

export default {
  getMessagesByRol,
  login,
  getAllRoles,
  sendMessages,
  createRole,
  uploadFile,
  deletedRole,
  getFiles,
  deleteFile,
  signUp,
  verifyUser,
  passwordRecovery,
  passwordRecoveryChange,
};
