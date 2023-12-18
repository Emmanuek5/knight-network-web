const { spawn } = require("child_process");
const readline = require("readline");
const fs = require("fs");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to get user input for domain
const getUserInput = () => {
  return new Promise((resolve) => {
    rl.question("Enter your domain: ", (domain) => {
      resolve({ domain });
    });
  });
};

// Function to execute OpenSSL command to generate a self-signed certificate, private key, and CA file
const generateSelfSignedCertificate = ({ domain }) => {
  const certPath = ".obsidian/server/certs";
  const certFileName = `${domain}_self_signed_cert.pem`;
  const privateKeyFileName = `${domain}_private_key.pem`;
  const caFileName = `${domain}_ca.pem`;
  const certFilePath = `${certPath}/${certFileName}`;
  const privateKeyFilePath = `${certPath}/${privateKeyFileName}`;
  const caFilePath = `${certPath}/${caFileName}`;

  // Create the certs folder if it doesn't exist
  const mkdirCommand = `mkdir ${certPath}`;
  spawn(mkdirCommand, { shell: true });

  // Run OpenSSL command directly from Git bin folder to generate certificate, private key, and CA file
  const gitOpenSSLPath = "C:\\Program Files\\Git\\usr\\bin\\openssl.exe";
  const opensslCommand = `"${gitOpenSSLPath}" req -x509 -newkey rsa:4096 -nodes -sha256 -subj "/CN=${domain}" -keyout ${privateKeyFilePath} -out ${certFilePath} && "${gitOpenSSLPath}" x509 -outform PEM -in ${certFilePath} -out ${caFilePath}`;

  console.log("Executing OpenSSL command:", opensslCommand);

  const opensslProcess = spawn(opensslCommand, { shell: true });

  opensslProcess.stdout.on("data", (data) => {
    console.log(`OpenSSL output: ${data}`);
  });

  opensslProcess.stderr.on("data", (data) => {
    console.error(`OpenSSL error: ${data}`);
  });

  opensslProcess.on("close", (code) => {
    if (code === 0) {
      console.log(
        `Self-signed certificate, private key, and CA file created and saved to ${certFilePath}, ${privateKeyFilePath}, and ${caFilePath}`
      );
    } else {
      console.error(`Error running OpenSSL command. Exit code: ${code}`);
    }
    rl.close();
  });
};

// Call the function to get user input and generate the self-signed certificate, private key, and CA file
(async () => {
  const userInput = await getUserInput();
  generateSelfSignedCertificate(userInput);
})();
