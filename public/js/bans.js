const route = "/api/ban/list";

// Use Fetch API instead of XMLHttpRequest
// Assuming this is the same fetch logic from before
fetch("/api/ban/list")
  .then((response) => response.json())
  .then((data) => {
    const table = document.querySelector("table");

    // Assuming 'data' is an array of ban objects
    data.forEach((ban) => {
      const row = table.insertRow();

      // Assuming these are the properties of your ban object
      const properties = ["username", "reason", "expiry"];

      properties.forEach((prop) => {
        const cell = row.insertCell();
        cell.textContent = ban[prop];
      });
    });
  })
  .catch((error) => console.error("Error fetching data:", error));
