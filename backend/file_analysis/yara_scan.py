import os


def scan_with_yara(file_path: str):

    result = {
        "available": False,
        "matches": [],
    }

    try:
        import yara

        result["available"] = True

    except ImportError:

        return result

    rules_directory = os.path.join(
        os.path.dirname(__file__),
        "yara_rules"
    )

    if not os.path.exists(rules_directory):
        return result

    rule_files = {}

    for filename in os.listdir(rules_directory):

        if filename.endswith(".yar"):

            path = os.path.join(
                rules_directory,
                filename
            )

            rule_files[filename] = path

    if not rule_files:
        return result

    try:

        rules = yara.compile(
            filepaths=rule_files
        )

        matches = rules.match(file_path)

        result["matches"] = [
            {
                "rule": match.rule,
                "namespace": match.namespace,
            }
            for match in matches
        ]

    except Exception as error:

        result["error"] = str(error)

    return result