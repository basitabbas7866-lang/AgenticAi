from fastapi import APIRouter
from fastapi import UploadFile
from fastapi import File

import os

router = APIRouter()

UPLOAD_FOLDER = "app/uploads"

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)

@router.post("/upload")

async def upload_file(
    file: UploadFile = File(...)
):

    path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    with open(path, "wb") as f:
        f.write(await file.read())

    return {
        "message": "uploaded",
        "filename": file.filename
    }