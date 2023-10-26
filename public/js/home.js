
const clientCodeButton = document.getElementById("client_code");
const codeBlocks = document.querySelectorAll(".code_block");
const serverCodeButton = document.getElementById("server_code");
const clientCodeSection = document.querySelector(".example_code.client_code");
const serverCodeSection = document.querySelector(".example_code.server_code");
const clientModeButton = document.querySelector(".client-mode");
const serverModeButton = document.querySelector(".server-mode");
const sidebar = document.querySelector(".sidebar");
const serverModeSidebar = document.querySelector(".server-mode_sidebar");
const clientModeSidebar = document.querySelector(".client-mode_sidebar");
const clientModeSidebarButtons = document.querySelectorAll(".client_buttons")
const  serverModeSidebarButtons = document.querySelectorAll(".server_buttons")

function toggleSidebar() {
    if (window.innerWidth <= 768) {
        // Hide the sidebar on smaller screens
        sidebar.style.display = "none";
    } else {
        // Show the sidebar on larger screens
        sidebar.style.display = "block";
    }
}

// Call the function initially
toggleSidebar();

// Listen for window resize events and adjust the sidebar accordingly
window.addEventListener("resize", toggleSidebar);

console.log(clientModeSidebarButtons)
function setActive(clickedButton, buttons) {
    buttons.forEach(button => {
        if (button === clickedButton) {
            button.classList.add("active");
        } else {
            button.classList.remove("active");
        }
    });
}


// Add click event listeners to client mode buttons
clientModeSidebarButtons.forEach(button => {
   console.log(button)
  button.addEventListener("click", () => {
        setActive(button, clientModeSidebarButtons);
    });
});

// Add click event listeners to server mode buttons
serverModeSidebarButtons.forEach(button => {
    button.addEventListener("click", () => {
        setActive(button, serverModeSidebarButtons);
    });
});



const options = {
    threshold: 0.01
};

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            fadeIn(entry.target, 1000);
        }
    });
}, options);

// Add the code sections to the observer
codeBlocks.forEach(codeBlock => {
    observer.observe(codeBlock);
});

function toggleSidebarMode() {
      if (clientModeButton.classList.contains("active")) {
         serverModeSidebar.style.display = "none";
         clientModeSidebar.style.display = "block";
      } else {
         serverModeSidebar.style.display = "block";
         clientModeSidebar.style.display = "none";
      }
}

clientModeButton.addEventListener("click", () => {
    popOut(clientCodeButton, 1000);
    clientCodeSection.style.display = "block";
    serverCodeSection.style.display = "none";
    fadeIn(clientCodeSection, 1000);
    fadeOut(serverCodeSection, 1000);
    clientModeButton.classList.add("active");
    serverModeButton.classList.remove("active");
    toggleSidebarMode();
});

serverModeButton.addEventListener("click", () => {
    popOut(serverModeButton, 1000);
    clientCodeSection.style.display = "none";
    serverCodeSection.style.display = "block";
    fadeOut(clientCodeSection, 1000);
    fadeIn(serverCodeSection, 1000);
    fadeIn(serverCodeSection, 1000);
    clientModeButton.classList.remove("active");
    serverModeButton.classList.add("active");
    toggleSidebarMode();
});

// Custom function to add fade-in effect
