// In your routes/myRouter.js file
const path = require("path");
const obsidian = require("../obsidian.js");
const router = new obsidian.Router();

router.get("/", (req, res) => {
    res.render("index.html", { title: "Hello World" });
    }
);

module.exports = router;
