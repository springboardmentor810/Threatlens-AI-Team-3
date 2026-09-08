import json
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent

TRAIN_FILE = BASE_DIR / "processed" / "train.jsonl"
TEST_FILE = BASE_DIR / "processed" / "test.jsonl"


def load_jsonl(file_path):
    """
    Reads the JSONL dataset one record at a time.

    Returns:
        records: list of EMBER records
        labels: corresponding 0/1 labels
    """

    records = []
    labels = []

    with open(file_path, "r", encoding="utf-8") as file:

        for line in file:

            if not line.strip():
                continue

            record = json.loads(line)

            label = record.get("label")

            if label not in (0, 1):
                continue

            records.append(record)
            labels.append(label)

    return records, labels


def load_datasets():

    print("Loading training data...")
    train_records, train_labels = load_jsonl(TRAIN_FILE)

    print("Loading testing data...")
    test_records, test_labels = load_jsonl(TEST_FILE)

    print("\nDataset loaded successfully.")

    print(f"Training samples: {len(train_records):,}")
    print(f"Testing samples:  {len(test_records):,}")

    print(
        f"Training labels → "
        f"Benign: {train_labels.count(0):,}, "
        f"Malware: {train_labels.count(1):,}"
    )

    print(
        f"Testing labels → "
        f"Benign: {test_labels.count(0):,}, "
        f"Malware: {test_labels.count(1):,}"
    )

    return (
        train_records,
        train_labels,
        test_records,
        test_labels
    )


if __name__ == "__main__":
    load_datasets()