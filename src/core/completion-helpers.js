/**
 * Switches global variable to a "completed" symbol. Adds +1 or +2 to percent property.
 */
function SetIconGreen(section = {}, entry = "") {

  /* Increase section percentage except the Game Status and Hints sections */
  switch (section.id) {

    case "hk-intro":
    case "hk-hints":
      break;

    case "hk-equipment":

      // double % for equipment
      section.percent += 2;
      break;

    // Hunter's Journal entries
    case "hk-journal":
      section.percent++;
      section.midPercent++;
      break;

    default:
      section.percent++;
  }

  section.entries[entry].icon = "green";
}

/**
 * Switches global variable to a "partially completed" symbol (prevents blurring the textPrefix).
 */
function SetIconPartial(section = {}, entry = "") {

  section.entries[entry].icon = "partial";
}

/**
 * Switches global variable to a "partially completed" symbol (prevents blurring whole entry).
 */
function SetIconPartialJournal(section = {}, entry = "") {

  /* Increase Hunter's Journal entries discovered amount */
  switch (section.id) {

    case "hk-journal":
      section.midPercent++;
      break;
  }

  section.entries[entry].icon = "partialJournal";
}

/**
 * Switches global variable to a "not completed" symbol
 */
function SetIconRed(section = {}, entry = "") {

  section.entries[entry].icon = "red";
}

/**
 * Switches global variable to no symbol (span with left padding)
 */
function SetIconNone(section = {}, entry = "") {

  section.entries[entry].icon = "none";
}

/**
 * Switches global variable to a chosen symbol
 */
function SetIcon(section = {}, entry = "", icon = "") {

  section.entries[entry].icon = icon;
}

export {
  SetIconGreen,
  SetIconPartial,
  SetIconPartialJournal,
  SetIconRed,
  SetIconNone,
  SetIcon
};
