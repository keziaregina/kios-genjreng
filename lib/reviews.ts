export const MIN_RATING = 1;
export const MAX_RATING = 5;
export const MAX_COMMENT_LENGTH = 500;

// The star input and the server guard read one table so a label can never drift from the number it describes.
export const RATING_LABEL: Record<number, string> = {
  1: "Buruk",
  2: "Kurang",
  3: "Cukup",
  4: "Bagus",
  5: "Luar biasa",
};
