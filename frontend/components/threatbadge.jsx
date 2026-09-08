function ThreatBadge({ status }) {
  const normalizedStatus = status?.toLowerCase();

  const className =
    normalizedStatus === "malware"
      ? "threat-badge malware"
      : normalizedStatus === "benign"
        ? "threat-badge benign"
        : "threat-badge unknown";

  return (
    <span className={className}>
      {status || "Unknown"}
    </span>
  );
}

export default ThreatBadge;