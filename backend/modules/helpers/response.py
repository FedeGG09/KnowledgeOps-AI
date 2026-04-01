# fastapi
from fastapi.responses import JSONResponse
# typing
from typing import Optional


def manage_messages(status_code):
    message = ""
    if status_code == 200:
        message = "Successful operation."
    elif status_code == 500:
        message = "An error occurred, try again later."
    elif status_code == 404:
        message = "Not found"
    elif status_code == 401:
        message = "Unauthorized, verify your credentials"

    return message


def manage_responses(
    message: Optional[str] = None,
    status: int = 200,
    data: dict = None,
    success: bool = True,
    log: Optional[str] = None,
    token: Optional[str] = None
) -> JSONResponse:

    if not message:
        message = manage_messages(status_code=status)

    if status in [404, 500, 401]:
        success = False

    response = {
        "message": message,
        "success": success,
        "status": status

    }

    if data:

        if token:

            data.update({"token": token})
            response.update({"data": data})

        else:

            response.update({"data": data})

    if log:

        response.update({"log": log})

    return JSONResponse(content=response, status_code=status)
