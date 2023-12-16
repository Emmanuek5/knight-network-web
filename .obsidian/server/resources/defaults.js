/**
 * Generates a modal with the specified type, title, content, and options.
 *
 * @param {string} type - The type of modal to generate.
 * @param {string} title - The title of the modal.
 * @param {string} content - The content of the modal.
 * @param {object} options - Additional options for the modal.
 * @return {Promise} A promise that resolves when the modal is closed.
 */
function modal(type, title, content, options) {
  return new Promise((resolve, reject) => {
    let modalHtml = `
      <div class="modal">
        <div class="modal-content">
          <span class="close-button">&times;</span>
          <h2>${title}</h2>
          <p>${content}</p>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHtml);
    const modalElement = document.body.lastElementChild;
    const closeButton = modalElement.querySelector(".close-button");
    modalElement.style.display = "block";

    // Close the modal and resolve the promise with null
    const closeModal = (result) => {
      modalElement.style.display = "none";
      modalElement.remove();
      resolve(result);
    };

    closeButton.onclick = () => closeModal(null);
    window.onclick = (event) => {
      if (event.target === modalElement) closeModal(null);
    };

    if (type === "question") {
      const buttonsHtml = `
        <div class="button-container">
          <button class="button" id="modalYesButton">${
            options.yesLabel || "Yes"
          }</button>
          <button class="button" id="modalNoButton">${
            options.noLabel || "No"
          }</button>
        </div>
      `;
      const contentDiv = modalElement.querySelector(".modal-content");
      contentDiv.insertAdjacentHTML("beforeend", buttonsHtml);

      document.getElementById("modalYesButton").onclick = () =>
        closeModal(true);
      document.getElementById("modalNoButton").onclick = () =>
        closeModal(false);
    }

    if (
      type === "multipleQuestions" &&
      options &&
      Array.isArray(options.questions)
    ) {
      const questionsHtml = `
        <div class="question">
          ${options.questions
            .map(
              (question, index) => `
              <button class="button" data-index="${index}">${question}</button>
            `
            )
            .join("")}
        </div>
      `;
      const contentDiv = modalElement.querySelector(".modal-content");
      contentDiv.insertAdjacentHTML("beforeend", questionsHtml);

      // Add click event listener to each question button
      const questionButtons = contentDiv.querySelectorAll(".question .button");
      questionButtons.forEach((button) => {
        button.addEventListener("click", () => {
          closeModal(+button.getAttribute("data-index"));
        });
      });
    }

    if (
      type === "input" &&
      options &&
      options.inputs &&
      Array.isArray(options.inputs)
    ) {
      const inputsHtml = options.inputs
        .map((input) => {
          if (input.type === "textarea") {
            return `
                <div class="input-container">
                  <label>${input.label}</label>
                  <textarea id="${input.name}" >${input.value || ""}</textarea>
                </div>
              `;
          }
          return `
                <div class="input-container">
                  <label>${input.label}</label>
                  <input id="${input.name}" type="${
            input.type || "text"
          }" value="${input.value || ""}">
                </div>
              `;
        })
        .join("");
      const contentDiv = modalElement.querySelector(".modal-content");
      contentDiv.insertAdjacentHTML("beforeend", inputsHtml);

      const submitButton = document.createElement("button");
      submitButton.className = "";
      submitButton.id = "modalSubmitButton";
      submitButton.innerText = options.submitLabel || "Submit";
      contentDiv.appendChild(submitButton);

      const inputValues = {};

      submitButton.onclick = () => {
        options.inputs.forEach((input) => {
          inputValues[input.name] = document.getElementById(input.name).value;
        });
        closeModal(inputValues);
      };
    }
  });
}

/**
 * Copy the defined text to clipboard or get the text from the element it is attached to.
 *
 * @param {string|null} text - The text to be copied. If not provided, the text will be obtained from the element the function is attached to.
 * @return {boolean} Returns true if the text was successfully copied to the clipboard.
 */
function copy(text = null) {
  // Copy the defined text to clipboard or get the text from the element it is attached to
  navigator.clipboard.writeText(text || this.textContent);
  return true;
}

/**
 * Creates an error message element and appends it to the body.
 *
 * @param {string} message - The error message to be displayed.
 * @param {string} position - The position of the error message element. Defaults to "bottom".
 * @param {number} animationDelay - The delay in milliseconds before the error message slides into view. Defaults to 3000.
 * @param {string} side - The side from which the error message slides into view. Defaults to "left".
 * @return {undefined}
 */
function error(
  message,
  position = "top",
  animationDelay = 3000,
  side = "left"
) {
  // Create the error message element
  const errorElement = document.createElement("div");
  errorElement.classList.add("error-container", position, side);
  errorElement.innerHTML = `  <button class="close-error-btn"><span >&times;</span></button>
    <p>${message}</p>
  `;

  // Style the error message to start hidden and slide into view
  errorElement.style.opacity = 0;

  // Append the error element to the body
  document.body.appendChild(errorElement);

  // Make the error message slide into view almost immediately after creation
  setTimeout(() => {
    errorElement.style.opacity = 1;
    errorElement.style.transform = "translateX(0)"; // Slide from side
  }, 10);

  // Function to hide and remove the error element
  // Function to hide and remove the error element
  const removeError = () => {
    // Depending on the side, apply the correct slide-out animation
    errorElement.style.animation =
      side === "left"
        ? "slideOutToLeft 0.5s forwards"
        : "slideOutToRight 0.5s forwards";

    // Wait for the slide-out transition before removing the element
    setTimeout(() => {
      errorElement.remove();
    }, 500); // Match the duration of the slide-out effect
  };

  // Attach click event to the close button
  const closeButton = errorElement.querySelector(".error-container button");
  closeButton.addEventListener("click", () => {
    console.log("close button clicked");
    clearTimeout(autoRemoveError); // Prevent auto remove if user closes manually
    removeError();
  });

  // Automatically remove the error after a delay
  const autoRemoveError = setTimeout(removeError, animationDelay);
}

/**
 * Creates a message element with the specified text and displays it on the screen.
 *
 * @param {string} messageText - The text to be displayed in the message element.
 * @param {string} [position="bottom"] - The position of the message element on the screen. Defaults to "bottom".
 * @param {number} [animationDelay=3000] - The delay in milliseconds before the message element starts animating. Defaults to 3000.
 * @param {string} [side="left"] - The side from which the message element slides in. Defaults to "left".
 */
function message(
  messageText,
  position = "bottom",
  animationDelay = 3000,
  side = "left"
) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message-container", position, side);
  messageElement.textContent = messageText;
  messageElement.style.backgroundColor = "green"; // Set background color to green by default

  // Insert the message into the DOM
  document.body.appendChild(messageElement);

  // Position message offscreen initially (slide in the direction based on the side)
  messageElement.style.transform =
    side === "left" ? "translateX(-100%)" : "translateX(100%)";
  messageElement.style.opacity = 0;

  // Animate message sliding in
  setTimeout(() => {
    messageElement.style.transform = "translateX(0)";
    messageElement.style.opacity = 1;
  }, 10);

  // Automatically dismiss the message after the specified delay
  setTimeout(() => {
    messageElement.style.opacity = 0;
    messageElement.style.transform =
      side === "left" ? "translateX(-100%)" : "translateX(100%)";

    // Remove the element after the animation
    setTimeout(() => messageElement.remove(), 400);
  }, animationDelay);
}

function notify(title, body, image, options, onClick) {
  // Check if the browser supports notifications
  if (!("Notification" in window)) {
    console.error("This browser does not support desktop notifications");
    return;
  }

  // Check if the user has granted permission to show notifications
  if (Notification.permission === "granted") {
    // Create a notification
    const notification = new Notification(title, {
      body: body,
      icon: image,
      ...options,
    });

    // Optional: Add click event listener to handle notification click
    notification.addEventListener("click", () => {
      if (onClick) {
        onClick();
      }
    });
  } else if (Notification.permission !== "denied") {
    // Request permission from the user
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        // Call the notify function again after getting permission
        notify(title, body, image, options);
      }
    });
  }
}

function getValue(key) {
  return localStorage.getItem(key);
}
