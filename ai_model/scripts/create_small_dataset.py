import json
import random
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

DATASET_DIR = BASE_DIR / "dataset" / "ember2018" / "ember2018"
OUTPUT_DIR = BASE_DIR / "processed"

TRAIN_OUTPUT = OUTPUT_DIR / "train.jsonl"
TEST_OUTPUT = OUTPUT_DIR / "test.jsonl"

# Small first version — safer for your laptop
TRAIN_PER_CLASS = 3_500
TEST_PER_CLASS = 1_000

TRAIN_FILES = [
    DATASET_DIR / "train_features_0.jsonl",
    DATASET_DIR / "train_features_1.jsonl",
    DATASET_DIR / "train_features_2.jsonl",
    DATASET_DIR / "train_features_3.jsonl",
    DATASET_DIR / "train_features_4.jsonl",
]

TEST_FILE = DATASET_DIR / "test_features.jsonl"

random.seed(42)


def collect_samples(files, benign_target, malware_target):
    benign = []
    malware = []

    for file_path in files:
        print(f"\nReading {file_path.name}...")

        with open(file_path, "r", encoding="utf-8") as file:
            for line in file:

                if not line.strip():
                    continue

                record = json.loads(line)
                label = record.get("label")

                if label == 0 and len(benign) < benign_target:
                    benign.append(record)

                elif label == 1 and len(malware) < malware_target:
                    malware.append(record)

                if (
                    len(benign) >= benign_target
                    and len(malware) >= malware_target
                ):
                    break

        print(
            f"Benign: {len(benign):,} | "
            f"Malware: {len(malware):,}"
        )

        if (
            len(benign) >= benign_target
            and len(malware) >= malware_target
        ):
            break

    return benign, malware


def save_records(records, output_file):
    random.shuffle(records)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    with open(output_file, "w", encoding="utf-8") as file:
        for record in records:
            file.write(json.dumps(record) + "\n")


def main():

    print("=" * 50)
    print("THREATLENS AI - SMALL EMBER DATASET CREATOR")
    print("=" * 50)

    print("\nCreating training dataset...")

    train_benign, train_malware = collect_samples(
        TRAIN_FILES,
        TRAIN_PER_CLASS,
        TRAIN_PER_CLASS
    )

    train_records = train_benign + train_malware

    save_records(train_records, TRAIN_OUTPUT)

    print(f"\nTraining records: {len(train_records):,}")
    print(f"Saved to: {TRAIN_OUTPUT}")

    print("\nCreating test dataset...")

    test_benign, test_malware = collect_samples(
        [TEST_FILE],
        TEST_PER_CLASS,
        TEST_PER_CLASS
    )

    test_records = test_benign + test_malware

    save_records(test_records, TEST_OUTPUT)

    print(f"\nTest records: {len(test_records):,}")
    print(f"Saved to: {TEST_OUTPUT}")

    print("\n" + "=" * 50)
    print("DATASET CREATION COMPLETE")
    print("=" * 50)


if __name__ == "__main__":
    main()