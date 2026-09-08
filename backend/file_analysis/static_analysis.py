import math
from collections import Counter

import pefile


SUSPICIOUS_APIS = {
    "VirtualAlloc",
    "VirtualAllocEx",
    "VirtualProtect",
    "VirtualProtectEx",
    "WriteProcessMemory",
    "CreateRemoteThread",
    "OpenProcess",
    "NtWriteVirtualMemory",
    "NtCreateThreadEx",
    "WinExec",
    "ShellExecuteA",
    "ShellExecuteW",
    "CreateProcessA",
    "CreateProcessW",
    "URLDownloadToFileA",
    "URLDownloadToFileW",
    "InternetOpenA",
    "InternetOpenW",
    "InternetOpenUrlA",
    "InternetOpenUrlW",
    "LoadLibraryA",
    "LoadLibraryW",
    "GetProcAddress",
    "RegOpenKeyA",
    "RegOpenKeyW",
    "RegSetValueA",
    "RegSetValueW",
}


def calculate_entropy(data):
    if not data:
        return 0.0

    counts = Counter(data)
    length = len(data)

    entropy = 0

    for count in counts.values():
        probability = count / length
        entropy -= probability * math.log2(probability)

    return round(entropy, 4)


def analyze_static(file_path: str):

    result = {
        "is_pe": False,
        "architecture": "Unknown",
        "entry_point": None,
        "image_base": None,
        "sections": [],
        "imports": [],
        "imported_dlls": [],
        "suspicious_apis": [],
        "entropy": 0,
        "section_count": 0,
    }

    try:
        pe = pefile.PE(file_path)

        result["is_pe"] = True

        machine = pe.FILE_HEADER.Machine

        if machine == 0x14C:
            result["architecture"] = "x86"

        elif machine == 0x8664:
            result["architecture"] = "x64"

        elif machine == 0xAA64:
            result["architecture"] = "ARM64"

        result["entry_point"] = hex(
            pe.OPTIONAL_HEADER.AddressOfEntryPoint
        )

        result["image_base"] = hex(
            pe.OPTIONAL_HEADER.ImageBase
        )

        total_entropy = 0

        for section in pe.sections:

            name = section.Name.rstrip(
                b"\x00"
            ).decode(errors="ignore")

            raw_data = section.get_data()

            entropy = calculate_entropy(raw_data)

            total_entropy += entropy

            result["sections"].append({
                "name": name,
                "virtual_size": section.Misc_VirtualSize,
                "raw_size": section.SizeOfRawData,
                "entropy": entropy,
                "characteristics": hex(
                    section.Characteristics
                ),
            })

        result["section_count"] = len(
            result["sections"]
        )

        if result["section_count"] > 0:
            result["entropy"] = round(
                total_entropy /
                result["section_count"],
                4
            )

        if hasattr(
            pe,
            "DIRECTORY_ENTRY_IMPORT"
        ):

            for entry in pe.DIRECTORY_ENTRY_IMPORT:

                dll = (
                    entry.dll.decode(errors="ignore")
                    if entry.dll
                    else "Unknown"
                )

                result["imported_dlls"].append(dll)

                for imported in entry.imports:

                    if not imported.name:
                        continue

                    api = imported.name.decode(
                        errors="ignore"
                    )

                    result["imports"].append({
                        "dll": dll,
                        "api": api,
                    })

                    if api in SUSPICIOUS_APIS:

                        result[
                            "suspicious_apis"
                        ].append({
                            "dll": dll,
                            "api": api,
                        })

        pe.close()

    except pefile.PEFormatError:
        result["error"] = (
            "File is not a valid Windows PE executable"
        )

    except Exception as error:
        result["error"] = str(error)

    return result