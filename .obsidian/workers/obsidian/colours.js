class CLOURS {
  // ANSI escape codes for text colors
  static RED_TEXT = "\x1b[31m";
  static GREEN_TEXT = "\x1b[32m";
  static YELLOW_TEXT = "\x1b[33m";
  static BLUE_TEXT = "\x1b[34m";
  static MAGENTA_TEXT = "\x1b[35m";
  static CYAN_TEXT = "\x1b[36m";
  static WHITE_TEXT = "\x1b[37m";

  // ANSI escape codes for background colors
  static BLACK_BACKGROUND = "\x1b[40m";
  static RED_BACKGROUND = "\x1b[41m";
  static GREEN_BACKGROUND = "\x1b[42m";
  static YELLOW_BACKGROUND = "\x1b[43m";
  static BLUE_BACKGROUND = "\x1b[44m";
  static MAGENTA_BACKGROUND = "\x1b[45m";
  static CYAN_BACKGROUND = "\x1b[46m";
  static WHITE_BACKGROUND = "\x1b[47m";

  // ANSI escape code for resetting colors
  static RESET = "\x1b[0m";

  // Function to apply color to text
  static applyColor(text, colorCode) {
    return `${colorCode}${text}${this.RESET}`;
  }
}

module.exports = {
  COLORS: CLOURS,
};
