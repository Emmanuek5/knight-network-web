if (!authenticated) {
  window.location.href = "/auth/login";
}

let page = 1;
let by = "date";
let order = "asc";
let pageCount = 0;

const select = document.querySelector("select");
fetch("/api/user/current/profile")
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    const userContainer = document.querySelector(".user-container");
    const infoContainer = document.querySelector(".info-container");

    // Update user information
    userContainer.innerHTML = `
      <div class="top">
        <img src="${data.user.image}" alt="Profile Picture" />
        <h2>${data.user.username}</h2>
      </div>
    `;

    infoContainer.innerHTML = `
      <p>Points: ${data.user.points}</p>
      <p>Rank: ${data.user.rank}</p>
      <p>Bio: ${data.user.bio}</p>
    `;

    // Update forum posts
    getPosts();
    getPageCount();

    select.addEventListener("change", (event) => {
      const value = event.target.value;
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

    const prevPageIcon = document.getElementById("prevPage");
    const nextPageIcon = document.getElementById("nextPage");

    // Add event listeners for forward and back icons
    prevPageIcon.addEventListener("click", () => {
      // Assuming there's some way to determine the total number of pages (totalPages)
      const totalPages = pageCount;
      if (page > 1) {
        page--;
        getPosts(page, by, order);
      }
    });

    nextPageIcon.addEventListener("click", () => {
      // Assuming there's some way to determine the total number of pages (totalPages)
      const totalPages = pageCount;
      if (page < totalPages) {
        page++;
        getPosts(page, by, order);
      }
    });
  })
  .catch((error) => {
    console.error("Error fetching user profile:", error);
  });
function getPosts(page = 1, by = "date", order = "asc") {
  const forumPostsContainer = document.querySelector(
    ".forum_posts_container .posts"
  );
  let route = `/api/user/current/forum_posts/${page}/${by}/${order}`;
  fetch(route)
    .then((response) => response.json())
    .then((data) => {
      forumPostsContainer.innerHTML = "";
      data.forumPosts.forEach((post) => {
        const postElement = document.createElement("div");
        postElement.innerHTML = `
          <div class="post">
            <h3>${post.title}</h3>
            <p>${post.description}</p>
            <p>Posted on ${new Date(post.date).toLocaleString()}</p>
            <p>Likes: ${post.likes} | Dislikes: ${post.dislikes}</p>
            <div class="actions">
              <button class="edit"><i class="fas fa-edit"></i> Edit</button>
              <button class="delete"><i class="fas fa-trash-alt"></i> Delete</button>
            </div>
          </div>
        `;

        const editButton = postElement.querySelector(".edit");
        editButton.addEventListener("click", () => {
          editPost(post.id, post.title, post.content);
        });

        const deleteButton = postElement.querySelector(".delete");
        deleteButton.addEventListener("click", () => {
          deletePost(post.id);
        });
        forumPostsContainer.appendChild(postElement);
      });
    });
}

function getPageCount() {
  fetch("/api/user/current/forum_posts/pagenumber")
    .then((response) => response.json())
    .then((data) => {
      pageCount = data.pageNumber;
      const paginationWheel = document.querySelector(
        ".pagination-wheel .wheel"
      );

      for (let i = 1; i <= pageCount; i++) {
        const button = document.createElement("button");
        button.textContent = i;
        button.addEventListener("click", () => {
          getPosts(i, by, order);
        });
        paginationWheel.appendChild(button);
      }
    });
}

function editPost(postId, title, content) {
  let modal_content = {};
  let route = `/api/forums/${postId}/edit`;
  modal("input", "Edit Post", "Enter the new title and Content of the post", {
    inputs: [
      {
        label: "Title",
        type: "text",
        name: "title",
        value: title,
      },
      {
        label: "Content",
        type: "textarea",
        name: "content",
        value: content,
      },
    ],
  }).then((result) => {
    if (result) {
      if (!result.title || !result.content) {
        error("All fields are required", "top", 3000, "left");
        return;
      }
      modal_content = result;
      modal(
        "question",
        "Edit Post Confirmation",
        "Are you sure you want to edit this post?",
        {
          yesLabel: "Yes ",
          noLabel: "No",
        }
      ).then((result) => {
        if (result) {
          fetch(route, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: modal_content.title,
              content: modal_content.content,
            }),
          }).then((response) => {
            if (response.ok) {
              message("Post edited successfully", "top", 3000, "left");
              getPosts();
            } else {
              error("Something went wrong", "top", 3000, "left");
            }
          });
        }
      });
    }
  });
}

function deletePost(postId) {
  let route = `/api/forums/${postId}`;
  modal(
    "question",
    "Delete Post",
    "Are you sure you want to delete this post?",
    {
      yesLabel: "Yes",
      noLabel: "No",
    }
  ).then((result) => {
    if (result) {
      fetch(route, {
        method: "DELETE",
      }).then((response) => {
        if (response.ok) {
          message("Post deleted successfully", "top", 3000, "left");
          getPosts();
        }
      });
    }
  });
}
