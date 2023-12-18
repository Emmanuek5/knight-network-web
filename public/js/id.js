const id = document.querySelector("input[name='forum_id']").value;
const forumPostView = document.querySelector(".forum_post_view_container");
const route = "/api/forums/";
const title = document.querySelector(".forum_post_content h1");
const userImage = document.querySelector(".top img");
const username = document.querySelector(".top h2");
const postDate = document.querySelector(".top p");
const likeButton = document.getElementById("likeButtonID");
const dislikeButton = document.getElementById("dislikeButtonID");
const reportButton = document.querySelector(".top button:nth-child(3)");
const likeCount = document.querySelector(".top p:nth-child(4)");
const dislikeCount = document.querySelector(".top p:nth-child(5)");
const reply_container = document.querySelector(".comments_container");
const commentForm = document.querySelector("form");
const select = document.querySelector("select");
let hasLiked = false;
let hasDisliked = false;
let order = "asc";
let by = "date";
let page = 1;

select.addEventListener("change", (event) => {
  order = event.target.value;

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

commentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(commentForm);

  fetch(route + "reply/" + id, {
    method: "POST",
    body: formData,
  }).then((response) => {
    if (response.ok) {
      fetchReplies(order, by, page);
    } else {
      displayError("Error posting comment to the server");
    }
  });
});
async function fetchData() {
  try {
    const response = await fetch(route + id);
    const data = await response.json();

    if (data.error) {
      displayError("Error Getting Forum posts from the server");
      return;
    }
    fetchReplies(order, by, page);
    userImage.src = data.userimageurl || "";
    console.log(data, userImage);
    title.textContent = data.title || "";
    document.getElementById("likeCount").textContent = data.likes || 0;
    document.getElementById("dislikeCount").textContent = data.dislikes || 0;
    username.innerHTML = `<a href="/user/${data.userid}">${data.username}</a>`;
    postDate.textContent = formatDate(data.date) || "";

    const hasLikedResponse = await fetch(route + "hasliked/" + id);
    const hasLikedData = await hasLikedResponse.json();
    updateLikedStatus(hasLikedData.liked);

    const hasDislikedResponse = await fetch(route + "hasdisliked/" + id);
    const hasDislikedData = await hasDislikedResponse.json();
    updateDislikedStatus(hasDislikedData.disliked);
  } catch (error) {
    console.error("Error fetching data:", error);
    displayError("Error fetching data from the server");
  }
}

function updateLikedStatus(liked) {
  if (liked) {
    likeButton.classList.add("liked");
    hasLiked = true;
  } else {
    likeButton.classList.remove("liked");
    hasLiked = false;
  }
}

function updateDislikedStatus(disliked) {
  if (disliked) {
    dislikeButton.classList.add("disliked");
    hasDisliked = true;
  } else {
    dislikeButton.classList.remove("disliked");
    hasDisliked = false;
  }
}

async function updateCounts() {
  try {
    const response = await fetch(route + id);
    const data = await response.json();

    if (data.error) {
      displayError("Error updating counts from the server");
      return;
    }

    document.getElementById("likeCount").textContent = data.likes || 0;
    document.getElementById("dislikeCount").textContent = data.dislikes || 0;

    const hasLikedResponse = await fetch(route + "hasliked/" + id);
    const hasLikedData = await hasLikedResponse.json();
    updateLikedStatus(hasLikedData.liked);

    const hasDislikedResponse = await fetch(route + "hasdisliked/" + id);
    const hasDislikedData = await hasDislikedResponse.json();
    updateDislikedStatus(hasDislikedData.disliked);
  } catch (error) {
    console.error("Error updating counts:", error);
    displayError("Error updating counts from the server");
  }
}

function like() {
  if (!hasLiked) {
    fetchAction(route + "like/" + id);
  } else {
    updateCounts();
  }
}

function dislike() {
  if (!hasDisliked) {
    fetchAction(route + "dislike/" + id);
  } else {
    updateCounts();
  }
}

function fetchAction(actionRoute) {
  fetch(actionRoute, {
    method: "POST",
  })
    .then((res) => {
      if (res.ok) {
        updateCounts();
        if (actionRoute.includes("like")) {
          likeButton.classList.add("liked");
        } else if (actionRoute.includes("dislike")) {
          dislikeButton.classList.add("disliked");
        }
      } else {
        modal(
          "",
          `You already ${
            actionRoute.includes("like") ? "liked" : "disliked"
          } this post`,
          `You can only ${
            actionRoute.includes("like") ? "like" : "dislike"
          } a post once`
        );
      }
    })
    .catch((error) => {
      console.error("Error performing action:", error);
    });
}

function displayError(message) {
  error(message);
}

function formatDate(date) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(date).toLocaleDateString("en-US", options);
}

function fetchReplies(order, by, page) {
  let Reply_route =
    route + "replies/" + id + "/" + by + "/" + order + "/" + page;
  fetch(Reply_route)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        displayError("Error fetching replies from the server");
      }
    })
    .then((data) => {
      if (data.error) {
        displayError(data.message);
      }

      displayReplies(data.replies);
    });
}
function displayReplies(replies) {
  const commentsContainer = document.getElementById("comments_container");

  if (replies.length === 0) {
    commentsContainer.innerHTML = "";
    const noCommentsDiv = document.createElement("div");
    noCommentsDiv.classList.add("no_comments");
    noCommentsDiv.innerHTML = "<h3>No comments yet</h3>";
    commentsContainer.appendChild(noCommentsDiv);
    return;
  }
  // Clear previous comments
  commentsContainer.innerHTML = "";

  replies.forEach((reply) => {
    const commentDiv = document.createElement("div");
    commentDiv.classList.add("comment");

    const commentTop = document.createElement("div");
    commentTop.classList.add("comment_top");

    const userImage = document.createElement("img");
    userImage.src = reply.imageurl;
    userImage.alt = "User Image";
    userImage.width = 50;
    userImage.height = 50;
    commentTop.appendChild(userImage);

    const userDetails = document.createElement("div");
    userDetails.classList.add("user_details");

    const username = document.createElement("h2");
    username.textContent = reply.username;
    userDetails.appendChild(username);

    const commentDate = document.createElement("p");
    commentDate.textContent = new Date(reply.created_at).toLocaleString();
    userDetails.appendChild(commentDate);

    commentTop.appendChild(userDetails);

    commentDiv.appendChild(commentTop);

    const commentContent = document.createElement("div");
    commentContent.classList.add("comment_content");

    const message = document.createElement("p");
    message.textContent = reply.message;
    commentContent.appendChild(message);

    commentDiv.appendChild(commentContent);

    const commentBottom = document.createElement("div");
    commentBottom.classList.add("comment_bottom");

    const likeButton = document.createElement("button");
    likeButton.classList.add("comment_like_button");
    if (reply.liked) {
      likeButton.classList.add("liked");
    }

    likeButton.innerHTML = `<i class="fa fa-thumbs-up"> </i> <span>${reply.likes}</span>`;
    likeButton.addEventListener("click", () => handleLike(reply.id));
    commentBottom.appendChild(likeButton);

    const dislikeButton = document.createElement("button");
    dislikeButton.classList.add("comment_dislike_button");
    if (reply.disliked) {
      dislikeButton.classList.add("disliked");
    }
    dislikeButton.innerHTML = `<i class="fa fa-thumbs-down"></i> <span>${reply.dislikes}</span>`;
    dislikeButton.addEventListener("click", () => handleDislike(reply.id));
    commentBottom.appendChild(dislikeButton);

    const replyButton = document.createElement("button");
    replyButton.innerHTML = `<i class="fa fa-reply"></i>`;
    commentBottom.appendChild(replyButton);

    commentDiv.appendChild(commentBottom);

    commentsContainer.appendChild(commentDiv);
  });
}

function handleLike(commentId) {
  let Like_route = route + "reply/" + commentId + "/like";
  fetch(Like_route, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        displayError("Error fetching replies from the server");
      }
    })
    .then((data) => {
      if (data.error) {
        displayError(data.message);
        return;
      }
      fetchReplies(order, by, page);
    });
}

function handleDislike(commentId) {
  let Dislike_route = route + "reply/" + commentId + "/dislike";
  fetch(Dislike_route, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        displayError("Error fetching replies from the server");
      }
    })
    .then((data) => {
      if (data.error) {
        displayError(data.message);
        return;
      }
      fetchReplies(order, by, page);
    });
}

function report() {
  modal(
    "question",
    "Report Confirmation",
    "Are you sure you want to report this post?",
    {
      yesLabel: "Yes ",
      noLabel: "No",
    }
  ).then((result) => {
    if (result) {
      let questions = [
        "Sexual Content",
        "Hate Speech",
        "Violence",
        "Spam",
        "Other",
      ];
      modal(
        "multipleQuestions",
        "Report Post",
        "Why are you reporting this post?",
        {
          questions,
        }
      ).then((result) => {
        console.log(result);
        if (result !== 4) {
          // 4 is the index of "Other"
          // 0 is the index of "Sexual Content"
          //replace the index with the value of the question
          fetch(route + "report/" + id, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              reason: questions[result],
            }),
          }).then((response) => {
            if (response.ok) {
              message("Post reported successfully", "top", 3000, "left");
              getPosts();
            } else {
              error("Something went wrong", "top", 3000, "left");
            }
          });
        } else {
          modal("input", "Report Reason", "", {
            inputs: [
              {
                name: "reason",
                label: "Reason",
                type: "text",
                placeholder: "Enter reason",
              },
            ],
            submitLabel: "Report",
          }).then((result) => {
            if (result) {
              if (!result.reason) {
                error("All fields are required", "top", 3000, "left");
                return;
              }
              fetch(route + "report/" + id, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  reason: result.reason,
                }),
              }).then((response) => {
                if (response.ok) {
                  message("Post reported successfully", "top", 3000, "left");
                } else {
                  error("Something went wrong", "top", 3000, "left");
                }
              });
            }
          });
        }
      });
    }
  });
}

function getPosts(page, by, order) {
  fetchReplies(order, by, page);
}

fetchData();
