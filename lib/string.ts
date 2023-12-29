export function titleCase(s: string): string {
  return s.split(/(?=[A-Z][a-z])|[\-_\s]+/).filter((e) => !!e).map((str) => {
    const [head, ...rest] = str;
    return `${head?.toUpperCase()}${rest.join("")}`;
  }).join(" ");
}

export function normalizeAccidentals(str: string): string {
  return str.replace("♯", "#").replace("♭", "b");
}
