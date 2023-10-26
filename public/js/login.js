const form = document.querySelector("form");
const error = document.querySelector(".error");
const inputs = document.querySelectorAll("input");
const route1 = "/api/auth/login";
const route2 = "/api/auth/signup";
const currentlocation = window.location.href;
console.log(authenticated);

if (authenticated) {
  window.location = "/";
}

if (currentlocation.includes("signup")) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    let username = "";
    let password = "";
    let email = "";
    for (let input of inputs) {
      if (input.name === "username") {
        username = input.value;
      } else if (input.name === "password") {
        password = input.value;
      } else if (input.name === "email") {
        email = input.value;
      }
    }

    const json = {
      username: username,
      email: email,
      password: password,
    };

    const response = await fetch(route2, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json),
    });
    const result = await response.json();
    if (result.success) {
      window.location = "/";
    } else {
      const { message } = result;
      error.style.display = "block";
      error.innerHTML = `<p>${message}</p>`;
      setTimeout(() => {
        error.style.display = "none";
      }, 3000);
    }
  });
} else if (currentlocation.includes("login")) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    let username = "";
    let password = "";
    for (let input of inputs) {
      if (input.name === "username") {
        username = input.value;
      } else if (input.name === "password") {
        password = input.value;
      }
    }

    const json = {
      username: username,
      password: password,
    };

    const response = await fetch(route1, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json),
    });
    const result = await response.json();
    if (result.success) {
      window.location = "/";
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

if (authenticated) {
  window.location = "/";
}
