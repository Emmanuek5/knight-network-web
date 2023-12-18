const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { COLORS } = require("../workers");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const logger = (message, color = COLORS.BLUE_TEXT) => {
  console.log(
    COLORS.YELLOW_TEXT +
      "[CERTS GENERATOR] - " +
      COLORS.applyColor(message, color)
  );
};

const loggerError = (message, color = COLORS.RED_TEXT) => {
  console.log(
    COLORS.YELLOW_TEXT +
      "[CERTS GENERATOR] - " +
      COLORS.applyColor(message, color)
  );
};

const baseLetEncryptPath = "/etc/letsencrypt/live"; // Adjust this to your Let's Encrypt base path

function copyCerts(domain) {
  const sourcePath = path.join(baseLetEncryptPath, domain);
  const destinationPath = path.join(
    process.cwd(),
    ".obsidian/server/certs",
    domain
  );

  // Check if the source path exists
  if (!fs.existsSync(sourcePath)) {
    loggerError(
      `Certificates for domain '${domain}' not found at '${sourcePath}'.`
    );
    return;
  }

  // Create the destination folder if it doesn't exist
  if (!fs.existsSync(destinationPath)) {
    fs.mkdirSync(destinationPath, { recursive: true });
  }

  // Copy cert and private key files
  const certFileName = "fullchain.pem";
  const privateKeyFileName = "privkey.pem";

  fs.copyFileSync(
    path.join(sourcePath, certFileName),
    path.join(destinationPath, certFileName)
  );
  fs.copyFileSync(
    path.join(sourcePath, privateKeyFileName),
    path.join(destinationPath, privateKeyFileName)
  );

  logger(
    `Certificates for domain '${domain}' to ${destinationPath}' copied successfully.`
  );
}

// Prompt user for domain
rl.question("Enter the domain: ", (domain) => {
  copyCerts(domain);
  rl.close();
});
