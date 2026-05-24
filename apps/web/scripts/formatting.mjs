const applyLines = (string, cb) => string.split('\n').map(cb).join('\n');

const formatMultilinePrefix = (prefix, string) => applyLines(
  string.trimEnd(),
  line => prefix + line,
);

export const printCommand = (parts, cwd = undefined) => {
  let prefix;
  if (cwd) {
    prefix = `(${cwd}) `;
  } else {
    prefix = "";
  };

  const formatted = parts.map(escapeArgument).join(' ');
  console.log(`${prefix}\x1b[97m$ \x1b[1m${formatted}\x1b[0m`);
};

export const comment = comment => console.log(
  applyLines(
    comment,
    line => `$ \x1b[37m# ${line}\x1b[0m`,
  ),
);

function escapeArgument(arg) {
  let needsOuterQuotes = false;
  let out = "";

  for (const ch of arg) {
    if (ch == ' ') {
      needsOuterQuotes = true;
    };

    switch (ch) {
      case '\\':
      case '!':
      case '`':
      case '$':
      case '(':
      case ')':
        out += `\\${ch}`;

        break;

      case '"':
        if (needsOuterQuotes) {
          out += '"';
        };

        out += `'${ch}'`;

        if (needsOuterQuotes) {
          out += '"';
        };

        break;

      default:
        if (' ' <= ch && ch <= '~') {
          out += ch;
        } else if ('\x00' <= ch && ch <= '\xFF') {
          out += `\\x${ch.charCodeAt(0).toString(16).padStart(2, '0')}`;
        } else {
          out += `\\u{${ch.charCodeAt(0).toString(16).padStart(4, '0')}}`;
        };
    };
  };

  if (needsOuterQuotes) {
    out = `"${out}"`;
  };

  return out;
}
