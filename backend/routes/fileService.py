from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Header
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from models.models import User, Chat
from sqlalchemy import select
from db.db import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from routes.chatService import ch

from modules.oauth import get_current_user, credentials_exception
from constantes import UPLOAD_PATH, MAX_UPLOAD_FILE_SIZE

from typing import List

# schemas
from schemas.fileModel import FileModel


# importing os module
import os

from modules.guardar_archivos import guardar_archivo

routerFiles = APIRouter()

# https://stackoverflow.com/questions/63048825/how-to-upload-file-using-fastapi


@routerFiles.post("/files/upload", tags=['files'])
async def upload(token: str = Header(default=""), files: List[UploadFile] = File(...), db: AsyncSession = Depends(get_db)):
    # VALIDAR JWT
    authorized = await get_current_user(
        db=db,
        token=token
    )

    path = UPLOAD_PATH

    if not authorized:
        raise credentials_exception

    if not os.path.isdir(path):
        os.mkdir(path)
    file_names = [
    "CW54909_-_2_Contrato_(para_firma)docx.pdf",
    "Bases Técncias (BT) -CC-001 Rev1.pdf",
    "ANEXO BGC.pdf",
    "Bases Especiales de Contratacion SGP-12CON-BASEC-00002 CC001 Rev 0.pdf",
    "Bases Generales de Contratación (BGC) Rev. 5.pdf",
    "A22M451-5900-BASCN-00006_Anexo6A_RAF CC01 TOVE IV_Rev.1.pdf",
    "A22M451-5900-BASCN-00006_Anexo6_BMP CC01 TOVE IV_Rev.1.pdf",
    "ADENDA A LAS BT CC-001.pdf",
    "ANEXO 2 EGDEV_BMP_ CC01_ 17Nov23.pdf",
    "ANEXO 2 Bases Comerciales CC-01 Rev.2 23_11_20.pdf",
    "1. MAM-PA-CM-SS-S-ON-CC01-EGDEV WP1-WP2-WP3 Signed.pdf"
    ]
     
    for file in files:
        if file.filename not in file_names:
            
            raise HTTPException(
                status_code=401, 
                detail="File not allowed: " + file.filename
            )
        
        elif (file.filename in file_names) and (file.filename in os.listdir(path)):
            
            raise HTTPException(
                status_code=400, 
                detail="File already exists: " + file.filename
            )
        
        else:
        
            file_size = file.size / 1048576
            
            print("file_size", file_size)
            if file_size > MAX_UPLOAD_FILE_SIZE:
                # more than 30 MB
                raise HTTPException(
                    status_code=400, 
                    detail="File too large " + file.filename
                )

            # check the content type (MIME type)
            content_type = file.content_type
            if content_type not in ["application/pdf"]:
                raise HTTPException(
                    status_code=400, detail="Invalid file type " + file.filename)
            
            ruta_destino = guardar_archivo(archivo=file, ruta_guardado=path)
            
            if ruta_destino:
                ch.add_new_document_to_vectorstore(path=ruta_destino)

            return {"message": f"Successfuly uploaded {[file.filename for file in files]}"}


@routerFiles.get("/files/view", tags=['files'])
async def view_current_files(token: str = Header(default=""),  db: AsyncSession = Depends(get_db)):
    # VALIDAR JWT
    authorized = await get_current_user(
        db=db,
        token=token
    )

    if not authorized:
        raise credentials_exception

    path = UPLOAD_PATH
    if not os.path.isdir(path):

        return JSONResponse(content={"message": "Path not found"}, status_code=404)

    else:

        archivos = os.listdir(path)
        return JSONResponse(content={"archivos": archivos}, status_code=200)


# Ruta que elimina un archivo específico
@routerFiles.post("/files/delete", tags=['files'])
async def delete_file(
    data: FileModel,
    token: str = Header(default=""),
    db: AsyncSession = Depends(get_db)
):
    # VALIDAR JWT
    authorized = await get_current_user(
        db=db,
        token=token
    )

    if not authorized:
        raise credentials_exception

    final_path = os.path.join(UPLOAD_PATH, data.filename)
    try:
        # Verificar si el archivo existe antes de eliminarlo
        if os.path.exists(final_path):
            os.remove(final_path)
            ch.reset_vectorstore()

            return {"message": f"File '{data.filename}' deleted successfully"}
        else:
            return JSONResponse({
                "message": f"File '{data.filename}' does not exist"
            }, status_code=404)

    except PermissionError:
        raise HTTPException(
            status_code=403, detail="You are unauthorized to delete this file."
        )
    except Exception as e:
        print(e)
        return str(e)

######################
#   ver vectorstore  #
######################


@routerFiles.get("/vectorstore", tags=['files'])
async def view_vectorstore(
    token: str = Header(default=""),
    db: AsyncSession = Depends(get_db)
):
    # VALIDAR JWT
    authorized = await get_current_user(
        db=db,
        token=token
    )

    if not authorized:
        raise credentials_exception

    try:

        # Verificar si el archivo existe antes de eliminarlo
        return ch.view_vectorstore()

    except PermissionError:
        raise HTTPException(
            status_code=403, detail="You are unauthorized to delete this file."
        )
    except Exception as e:
        print(e)
        return str(e)
