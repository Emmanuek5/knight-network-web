const { spawn, exec } = require("child_process");
const readline = require("readline");
const fs = require("fs");
const { COLORS } = require("../workers");

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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to get user input for domain
const getUserInput = () => {
  return new Promise((resolve) => {
    rl.question(
      COLORS.BLUE_TEXT +
        "Enter the domain: " +
        COLORS.RESET +
        COLORS.YELLOW_TEXT,
      (domain) => {
        resolve({ domain });
      }
    );
  });
};

// Function to execute OpenSSL command to generate a self-signed certificate, private key, and CA file
const generateSelfSignedCertificate = ({ domain }) => {
  const certPath = `.obsidian/server/certs/${domain}`;
  const certFileName = "self_signed_cert.pem";
  const privateKeyFileName = "private_key.pem";
  const caFileName = "ca.pem";
  const certFilePath = `${certPath}/${certFileName}`;
  const privateKeyFilePath = `${certPath}/${privateKeyFileName}`;
  const caFilePath = `${certPath}/${caFileName}`;

  // Create the domain folder if it doesn't exist
  const mkdirCommand = `mkdir "${certPath}"`;
  exec(mkdirCommand, (error) => {
    if (error) {
      loggerError(`Error creating domain folder: ${error}`);
    }
  });

  // Run OpenSSL command directly from Git bin folder to generate certificate, private key, and CA file
  const gitOpenSSLPath = "C:\\Program Files\\Git\\usr\\bin\\openssl.exe";
  const opensslCommand = `"${gitOpenSSLPath}" req -x509 -newkey rsa:4096 -nodes -sha256 -subj "/CN=${domain}" -keyout ${privateKeyFilePath} -out ${certFilePath} && "${gitOpenSSLPath}" x509 -outform PEM -in ${certFilePath} -out ${caFilePath}`;

  logger(`Running command: ${opensslCommand}`);

  const opensslProcess = spawn(opensslCommand, { shell: true });

  opensslProcess.stdout.on("data", (data) => {
    if (!data.startsWith(".") || data.startsWith("+")) {
      logger(`OpenSSL output: ${data}`);
    }
  });

  opensslProcess.stderr.on("data", (data) => {
    const errorMessage = data.toString();
    if (!errorMessage.startsWith(".") || errorMessage.startsWith("+")) {
      loggerError(`OpenSSL error: ${data}`);
    }
  });

  opensslProcess.on("close", (code) => {
    if (code === 0) {
      logger(
        `Self-signed certificate, private key, and CA file created and saved to \n ${certFilePath}, \n ${privateKeyFilePath}, and \n ${caFilePath}`
      );
    } else {
      loggerError(`Error running OpenSSL command. Exit code: ${code}`);
    }
    rl.close();
  });
};
// Call the function to get user input and generate the self-signed certificate, private key, and CA file
(async () => {
  const userInput = await getUserInput();
  logger("Generating self-signed certificate and private key...");
  generateSelfSignedCertificate(userInput);
})();
