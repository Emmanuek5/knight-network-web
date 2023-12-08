document.addEventListener("DOMContentLoaded", function () {
  // Get all <a> tags on the page
  const a_tags = document.querySelectorAll("a");
  let contentContainer = document.querySelector("body");

  // Add click event listeners to each <a> tag
  a_tags.forEach((a_tag) => {
    a_tag.addEventListener("click", function (event) {
      event.preventDefault();
      const target = a_tag.href;

      fetch(target)
        .then((response) => {
          if (!response.ok) {
            return response.text();
          }
          return response.text(); // Or .json() if the response is JSON
        })
        .then((data) => {
          // Replace the content of the container with the new data
          contentContainer.innerHTML = data;

          // Change the URL without reloading the page
          history.pushState({}, "", target);
        })
        .catch((error) => {
          console.error("Failed to fetch content:", error);
        });
    });
  });
});
