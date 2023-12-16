const ObsidianError = require("../../.obsidian/classes/ObsidianError");

function parsePlainTextResponse(plainText) {
  const lines = plainText.split("\n");
  const playerData = {};

  lines.forEach((line) => {
    const [key, value] = line.split(": ");
    if (key && value) {
      playerData[key.trim()] = value.trim();
    }
  });

  return playerData;
}

/**
 * Retrieves player information by UUID.
 *
 * @param {string} uuid - The UUID of the player.
 * @return {Promise<object>} The player information as a JSON object.
 * @throws {ObsidianError} If an error occurs while fetching the player data.
 */
async function getPlayerInfo(uuid) {
  try {
    const response = await fetch("http://localhost:5500/api/player/" + uuid);
    const plainTextData = await response.text();

    // Parse the plain text response into a JSON object
    const playerData = parsePlainTextResponse(plainTextData);
    return playerData;
  } catch (error) {
    console.log("Error fetching player data:", error);
  }
}

module.exports = {
  getPlayerInfo,
  parsePlainTextResponse,
};
