interface IMainPost {
  apiURL: string;
  method: string;
  data: any;
}
interface IMainGet {
  apiURL: string;
  method: string;
}

interface ISignUp {
  name: string;
  lastName: string;
  email: string;
  password: string;
}

interface ISendMessages {
  query: string;
  rol: number;
}

interface IUploadFile {
  setLoading: any;
  setFiles: any;
}

interface IPWDRecoveryCode {
  email: string;
}

interface IPWDRecoveryChange {
  email: string;
  recovery_code: string;
  password: string;
}

interface ICreateRole {
  name: string;
  description: string;
}

interface IDeletedRole {
  idRole: number;
}

interface IResponse {
  message: string;
  success: boolean;
  status: number;
}

interface IVerifyUser {
  email: string;
  verification_code: string;
}

// export types
export type {
  IMainPost,
  IMainGet,
  ISendMessages,
  IUploadFile,
  ICreateRole,
  IDeletedRole,
  IPWDRecoveryCode,
  IPWDRecoveryChange,
  ISignUp,
  IResponse,
  IVerifyUser,
};
