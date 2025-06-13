export const capitalizeFirst = (inputString: string) => {
  return inputString
    .split(/[\s_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const formatName = (name: string) => {
  return name
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
