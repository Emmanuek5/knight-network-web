//the html for the forum page is in /pages/forums/new.html
const route = "/api/forums/new";
const route2 = "/api/forums/list/1/date/asc";
let page = 1;
let by = "date";
let order = "asc";
const currentlocation = window.location.href;

if (!authenticated && currentlocation.includes("new")) {
  window.location = "/auth/login";
}

if (!currentlocation.includes("new")) {
  getPosts();
  getPageCount();
  const filterSlector = document.querySelector("select");
  const pageSelector = document.querySelector("select:nth-child(2)");

  filterSlector.addEventListener("change", (event) => {
    const value = event.target.value;
    //its structed in a newest , oldest , most likes , least likes, most dislikes , least dislikes
    if (value === "newest") {
      getPosts(1, "date", "asc");
      by = "date";
      order = "asc";
    }
    if (value === "oldest") {
      getPosts(1, "date", "desc");
      by = "date";
      order = "desc";
    }
    if (value === "most_liked") {
      getPosts(1, "likes", "asc");
      by = "likes";
      order = "asc";
    }

    if (value === "least_liked") {
      getPosts(1, "likes", "desc");
      by = "likes";
      order = "desc";
    }

    if (value === "most_disliked") {
      getPosts(1, "dislikes", "asc");
      by = "dislikes";
    }

    if (value === "least_disliked") {
      getPosts(1, "dislikes", "desc");
      by = "dislikes";
      order = "desc";
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
      error(message, "bottom", 3000, "left");
    }
  });
}

function getPosts(page = 1, by = "date", order = "asc") {
  const forumContainer = document.querySelector(
    ".forum-container .forum-posts"
  );
  const response = fetch(
    route2.replace("1", page).replace("date", by).replace("asc", order)
  )
    .then((response) => response.json())
    .then((data) => {
      forumContainer.innerHTML = "";
      const result = data;
      if (result.length > 0) {
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
          postContent.textContent = post.description + ".....";

          // Append everything to the post container
          postContainer.appendChild(userBlock);
          postContainer.appendChild(postTitle);
          postContainer.appendChild(postContent);

          // Append the post container to the forum container
          forumContainer.appendChild(postContainer);
        });
      } else {
        error("No posts found", "bottom", 3000, "left");
      }
    });
}

function getPageCount() {
  fetch("/api/forums/pagenumber").then((response) => {
    response.json().then((data) => {
      const pageCount = data.pageNumber;
      const paginationWheel = document.querySelector(".pagination-wheel");

      for (let i = 1; i <= pageCount; i++) {
        const button = document.createElement("button");
        button.textContent = i;
        button.addEventListener("click", () => {
          getPosts(i, by, order);
        });
        paginationWheel.appendChild(button);
      }
    });
  });
}
