//the html for the forum page is in /pages/forums/new.html
const route = "/api/forums/new";
const route2 = "/api/forums/list";
const error = document.querySelector(".error");
const currentlocation = window.location.href;

if (!authenticated && currentlocation.includes("new")) {
  window.location = "/auth/login";
}

if (!currentlocation.includes("new")) {
  const forumContainer = document.querySelector(".forum-container");
  const response = fetch(route2)
    .then((response) => response.json())
    .then((data) => {
      const result = data;
      if (result) {
        // Map posts into HTML elements
        result.forEach((post) => {
          const postContainer = document.createElement("div");
          postContainer.classList.add("forum-post-container");

          // User Block
          const userBlock = document.createElement("div");
          userBlock.classList.add("user_block");

          const userImage = document.createElement("img");
          userImage.src = post.userimageurl; // You may want to fetch the user image URL from the API
          userImage.alt = "user";

          const usernameLink = document.createElement("a");
          usernameLink.href = `/user/${post.userid}`; // Use a proper link if available
          usernameLink.textContent = post.username;

          const usernameHeader = document.createElement("h4");
          usernameHeader.appendChild(userImage);
          usernameHeader.appendChild(usernameLink);

          userBlock.appendChild(usernameHeader);

          // Post details
          const postTitle = document.createElement("h3");
          const postLink = document.createElement("a");
          postLink.href = `/forums/${post.id}`; // Use a proper link if available
          postLink.textContent = post.title; // Assuming title is used as the name
          postTitle.appendChild(postLink);

          const postContent = document.createElement("p");
          postContent.textContent = post.content;

          // Append everything to the post container
          postContainer.appendChild(userBlock);
          postContainer.appendChild(postTitle);
          postContainer.appendChild(postContent);

          // Append the post container to the forum container
          forumContainer.appendChild(postContainer);
        });
      } else {
        // Handle error here
        error.style.display = "block";
        error.innerHTML = `<p>Error Getting Forum posts from the server</p>`;
        setTimeout(() => {
          error.style.display = "none";
        }, 3000);
      }
    });
} else {
  const form = document.querySelector(".forum-post-form");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const title = formData.get("title");
    const content = formData.get("content");
    const data = { title, content };
    const response = await fetch(route, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (result.success) {
      window.location = "/forums";
    } else {
      const { message } = result;
      error.style.display = "block";
      error.innerHTML = `<p>${message}</p>`;
      setTimeout(() => {
        error.style.display = "none";
      }, 3000);
    }
  });
}
