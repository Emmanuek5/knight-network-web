const style = document.createElement("link");
style.rel = "stylesheet";
style.href = "/server/default.css";
document.head.appendChild(style);

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

    if (type === "question" && options) {
      const buttonsHtml = `
        <div class="button-container"><button class="button" id="modalYesButton">${
          options.yesLabel || "Yes"
        }</button>
        <button class="button" id="modalNoButton">${
          options.noLabel || "No"
        }</button></div>
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
  });
}
