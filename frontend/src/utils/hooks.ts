import { useMutation, useQuery } from "@tanstack/react-query";
import https from "./https";
import { IUploadFile } from "./types";

export function useMessagesByRol(rol: number) {
  const { data, isLoading } = useQuery({
    queryKey: ["messages"],
    queryFn: () => https.getMessagesByRol(rol).then((res) => res),
  });
  return {
    data,
    isLoading,
  };
}

export function useAllRoles() {
  const {
    data,
    isLoading,
    refetch: refetchAllRoles,
  } = useQuery({
    queryKey: ["allRoles"],
    queryFn: () =>
      https.getAllRoles().then((res) => {
        return res;
      }),
  });
  return {
    data,
    isLoading,
    refetchAllRoles,
  };
}

export function useViewFiles() {
  const {
    data,
    isLoading,
    refetch: refetchFiles,
  } = useQuery({
    queryKey: ["viewFiles"],
    queryFn: () =>
      https.getFiles().then((res) => {
        return res;
      }),
  });
  return {
    data,
    isLoading,
    refetchFiles,
  };
}

export function useSendMessage({ query, rol }: { query: string; rol: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["sendMessage"],
    queryFn: () =>
      https.sendMessages({ query, rol }).then((res) => {
        console.log(`
          useSendMessage: ${JSON.stringify(res)}
        `);
        return res;
      }),
  });
  return {
    data,
    isLoading,
  };
}

export function useMutationSignUp({ setResponse }: { setResponse: any }) {
  return useMutation({
    mutationFn: (data: any) => https.signUp(data),
    onSuccess: (data: any) => {
      console.log("success");
      setResponse(data);
    },
    onError: (error) => {
      setResponse(error);
    },
  });
}

export function useMutationVerifyUser({ setResponse }: { setResponse: any }) {
  return useMutation({
    mutationFn: (data: any) => https.verifyUser(data),
    onSuccess: (data: any) => {
      console.log("success");
      setResponse(data);
    },
    onError: (error) => {
      setResponse(error);
      console.log(error);
    },
  });
}

export function useMutationCreateRole() {
  const { refetchAllRoles } = useAllRoles();
  return useMutation({
    mutationFn: (data: any) => https.createRole(data),
    onSuccess: () => {
      refetchAllRoles();
    },
    onError: (error) => {
      console.log(error);
    },
  });
}

export function useMutationRecoveryCode() {
  return useMutation({
    mutationFn: (data: any) => https.passwordRecovery(data),
    onSuccess: () => {
      console.log("success useMutationRecoveryCode");
    },
    onError: (error) => {
      console.log(error);
    },
  });
}

export function useMutationRecoveryChange() {
  return useMutation({
    mutationFn: (data: any) => https.passwordRecoveryChange(data),
    onSuccess: () => {
      console.log("success useMutationRecoveryChange");
    },
    onError: (error) => {
      console.log(error);
    },
  });
}

export function useMutationUploadFile({ setLoading, setFiles }: IUploadFile) {
  const { refetchFiles } = useViewFiles();
  return useMutation({
    mutationKey: ["uploadFile"],
    mutationFn: (data: any) => https.uploadFile(data),
    onSuccess: () => {
      setLoading(false);
      setFiles([]);
      refetchFiles();
    },
  });
}

export function useMutationDeleteFile({
  handleFinishDeleteFile,
}: {
  handleFinishDeleteFile: any;
}) {
  const { refetchFiles } = useViewFiles();
  return useMutation({
    mutationKey: ["deleteFile"],
    mutationFn: (data: any) => https.deleteFile(data),
    onSuccess: () => {
      handleFinishDeleteFile();
      refetchFiles();
    },
  });
}

export function useMutationDeleteRole() {
  const { refetchAllRoles } = useAllRoles();

  return useMutation({
    mutationKey: ["deleteRole"],
    mutationFn: (data: any) => https.deletedRole(data),
    onSuccess: () => {
      refetchAllRoles();
    },
  });
}
