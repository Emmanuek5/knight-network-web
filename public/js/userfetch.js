document.addEventListener("DOMContentLoaded", () => {
  const id = document.querySelector('input[name="id"]').value;
  fetch("/api/user/" + id)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const h2 = document.querySelector(".top h2");
      const img = document.querySelector(".user-container img");
      const mcUsername = document.getElementById("mc-username");
      const firstTimeOnline = document.getElementById("first-time-online");
      const lastTimeOnline = document.getElementById("last-time-online");
      const banned = document.getElementById("banned");
      const admin = document.getElementById("admin");
      const userClass = document.getElementById("class");
      const powerSlots = document.getElementById("power-slots");
      const bio = document.getElementById("bio");
      const points = document.getElementById("points");
      const rank = document.getElementById("rank");

      h2.textContent = data.username;
      img.src = data.image;

      bio.textContent = data.bio || "Not set";
      points.textContent = data.points;
      console.log(data.points);
      rank.textContent = data.rank || "Not set";

      if (data.playerData) {
        mcUsername.textContent = data.playerData.Name;
        firstTimeOnline.textContent = formatTimestamp(
          data.playerData["First played"]
        );
        lastTimeOnline.textContent = formatTimestamp(
          data.playerData["Last played"]
        );
        banned.textContent = data.playerData.banned === "true" ? "Yes" : "No";
        admin.textContent = data.playerData.op === "true" ? "Yes" : "No";
        userClass.textContent = data.playerData.class;
        // Populate power slots
        for (let i = 0; i < 10; i++) {
          const li = document.createElement("li");
          const powerSlotName = data.playerData["powerslot-" + i] || "Not set";
          li.textContent = `Power Slot ${i + 1}: ${
            powerSlotName
              ? powerSlotName == "null"
                ? "Not set"
                : powerSlotName
              : "Not set"
          }`;
          powerSlots.appendChild(li);
        }
      } else {
        const info_container = document.getElementById("info-container");
        info_container.innerHTML =
          "<h2>Minecraft account not found for this user</h2>";
      }
    });

  // Helper function to format timestamp
  function formatTimestamp(timestamp) {
    const date = new Date(parseInt(timestamp));
    return date.toLocaleString();
  }
});
