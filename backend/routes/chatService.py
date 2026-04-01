from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
import os
import shutil

from chat.chat import Chat

routerChat = APIRouter(prefix="/chat", tags=["Chat"])

# carpeta donde se guardan PDFs
UPLOAD_PATH = "./uploads/chat"

# instancia única
chat_instance = Chat(UPLOAD_PATH)


class ChatRequest(BaseModel):
    consulta: str


@routerChat.get("/health")
async def health():
    return {
        "status": "ok",
        "documents_loaded": len(chat_instance.documents),
        "chunks_loaded": len(chat_instance.vectorstore1.documents),
    }


@routerChat.post("/ask")
async def ask_chat(payload: ChatRequest):
    """
    Consulta al motor documental sin LLM.
    """
    try:
        respuesta = chat_instance.chatear(payload.consulta)
        return {"response": respuesta}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@routerChat.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Sube un PDF y lo agrega al vectorstore.
    """
    try:
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Solo se permiten PDFs")

        os.makedirs(UPLOAD_PATH, exist_ok=True)

        file_path = os.path.join(UPLOAD_PATH, file.filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        result = chat_instance.add_new_document_to_vectorstore(file_path)

        return {
            "message": "Archivo subido correctamente",
            "file": file.filename,
            "result": result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@routerChat.get("/documents")
async def view_documents():
    """
    Ver contenido cargado en memoria.
    """
    try:
        return chat_instance.view_vectorstore()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@routerChat.post("/reset")
async def reset_documents():
    """
    Limpia y vuelve a cargar desde la carpeta.
    """
    try:
        result = chat_instance.reset_vectorstore()
        return {"message": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
ch = chat_instance