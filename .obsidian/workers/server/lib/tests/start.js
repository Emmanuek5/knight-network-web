
const obsidian = require("../obsidian.js");
const path = require("path");

const app = obsidian();

app.get("/", (req, res) => {
  res.render("index.html", { title: "Hello World", name: "JJ" });
});


app.use("/jj", path.join(__dirname, "./routes.js"));
app.use("/assets", path.join(__dirname, "./assets"));
app.listen(3000, () => {
  console.log("Log");
});


