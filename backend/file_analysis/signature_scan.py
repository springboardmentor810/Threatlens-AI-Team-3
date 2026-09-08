import pefile


def check_signature(file_path: str):

    result = {
        "signed": False,
        "status": "Not Found",
    }

    try:

        pe = pefile.PE(file_path)

        security_directory = (
            pe.OPTIONAL_HEADER.DATA_DIRECTORY[
                pefile.DIRECTORY_ENTRY[
                    "IMAGE_DIRECTORY_ENTRY_SECURITY"
                ]
            ]
        )

        if security_directory.VirtualAddress != 0:

            result["signed"] = True
            result["status"] = "Signature Present"

        pe.close()

    except Exception as error:

        result["status"] = f"Unable to check: {error}"

    return result