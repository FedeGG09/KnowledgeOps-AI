from fastapi import UploadFile
import os
import random
import string


def guardar_archivo(archivo: UploadFile, ruta_guardado: str):
    ruta_destino = os.path.join(ruta_guardado, archivo.filename)
    if not os.path.exists(ruta_destino):
        with open(ruta_destino, "wb") as buffer:
            buffer.write(archivo.file.read())

        return ruta_destino
    else:
        return None
