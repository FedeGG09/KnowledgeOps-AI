import { useCallback } from "react";
import { Button, Card, Spinner } from "react-bootstrap";
import uploadImg from "../../../assets/icons/upload.svg";
import { useDropzone } from "react-dropzone";
import { Colors } from "../../../assets";
import { useMutationUploadFile } from "../../../utils/hooks";

type Props = {
  setFiles: (files: any) => void;
  files: any;
  loading: boolean;
  setLoading: (loading: boolean) => void;
};

const CustomDropzone = (props: Props) => {
  const { setFiles, files, setLoading, loading } = props;
  const { mutate } = useMutationUploadFile({ setLoading, setFiles });
  const onDrop = useCallback((acceptedFiles: any) => {
    if (acceptedFiles?.length) {
      setFiles((previousFiles: any) => [
        ...previousFiles,
        ...acceptedFiles.map((file: any) =>
          Object.assign(file, { preview: URL.createObjectURL(file) })
        ),
      ]);
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    noClick: true,
    onDrop,
    accept: {
      "aplication/pdf": [".pdf"],
    },
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!files.length) return;
    setLoading(true);
    const formData = new FormData();
    files.forEach((file: any) => {
      formData.append("files", file);
    });

    mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card
        {...getRootProps({
          className: "dropzone",
        })}
      >
        <Card.Body
          className="d-flex flex-column text-center justify-content-center align-items-center"
          style={
            isDragActive
              ? { backgroundColor: Colors.green.tertiary }
              : { backgroundColor: Colors.white.primary }
          }
        >
          <div style={{ width: 60, height: 60 }}>
            <img
              src={uploadImg}
              alt="upload"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                fill: "#fff000",
              }}
            />
          </div>

          <input {...getInputProps()} />
          {files && files.length > 0 ? (
            <Card.Text
              className="text-center my-4"
              style={{
                alignItems: "center",
                display: "flex",
                flexWrap: "wrap",
              }}
            >
              {files[0]?.path}
            </Card.Text>
          ) : (
            <Card.Text
              className="text-center bg-primay my-4"
              style={{
                alignItems: "center",
                display: "flex",
                width: "25%",
                flexWrap: "wrap",
              }}
            >
              Drop your file here Or
            </Card.Text>
          )}
          <div className="d-flex flex-row ">
            <Button variant="success" onClick={open} className="mx-2">
              Browse
            </Button>
            <Button
              type="submit"
              variant="warning"
              className="mx-2"
              disabled={!files.length || loading}
            >
              {loading ? (
                <Spinner animation="border" variant="light" />
              ) : (
                "Upload Files"
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </form>
  );
};

export default CustomDropzone;
