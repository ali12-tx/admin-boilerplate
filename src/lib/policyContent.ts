const POLICY_WRAPPER_ATTR = "data-policy-wrapper";
const POLICY_WRAPPER_STYLE = "margin:16px;";

const getWrapperContent = (html: string): string | null => {
  if (!html.trim()) return null;
  if (typeof document === "undefined") return null;

  const container = document.createElement("div");
  container.innerHTML = html;
  const first = container.firstElementChild;
  if (!first) return null;

  const isWrapper =
    first.getAttribute(POLICY_WRAPPER_ATTR) === "true" &&
    first.getAttribute("style")?.replace(/\s+/g, "") ===
      POLICY_WRAPPER_STYLE.replace(/\s+/g, "");

  return isWrapper ? first.innerHTML : null;
};

export const unwrapPolicyContent = (html: string): string => {
  const trimmed = html?.trim() ?? "";
  return getWrapperContent(trimmed) ?? trimmed;
};

export const wrapPolicyContent = (html: string): string => {
  const trimmed = html?.trim() ?? "";
  if (!trimmed) return "";
  if (getWrapperContent(trimmed) !== null) return trimmed;

  return `<div ${POLICY_WRAPPER_ATTR}="true" style="${POLICY_WRAPPER_STYLE}">${trimmed}</div>`;
};
