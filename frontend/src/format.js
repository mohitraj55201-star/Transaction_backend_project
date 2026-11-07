export function formatMoney(value, currency = "INR") {
  const amount = Number(value) || 0;
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

// Shows a long account number in groups of four so it is easier to read and read out.
export function groupId(id = "") {
  return (id.match(/.{1,4}/g) || []).join(" ");
}

export function statusLabel(status = "") {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

export function formatDate(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}
