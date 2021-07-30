const isStringEmpty = (s: string): boolean => {
  return s === "";
};

const isSHAhex = ({ s, numBits }: { s: string; numBits: number }): boolean => {
  if (s === undefined) {
    return false;
  }
  let regex = new RegExp(`[0-9A-Fa-f]{${numBits / 4}}`);
  return s.length === (numBits / 4) && regex.test(s);
};

export { isSHAhex, isStringEmpty };
