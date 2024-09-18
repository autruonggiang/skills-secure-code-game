// Welcome to Secure Code Game Season-2/Level-4!

// Follow the instructions below to get started:

// 1. test.js is passing but the code here is vulnerable
// 2. Review the code. Can you spot the bugs(s)?
// 3. Fix the code.js but ensure that test.js passes
// 4. Run hack.js and if passing then CONGRATS!
// 5. If stuck then read the hint
// 6. Compare your solution with solution.js

const express = require("express");
const he = require("he");
const bodyParser = require("body-parser");
const sax = require("sax");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process"); // Corrected import
const RateLimit = require("express-rate-limit");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.text({ type: "application/xml" }));

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadLimiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per windowMs
});

app.post("/ufo/upload", uploadLimiter, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  console.log("Received uploaded file:", req.file.originalname);

  const SAFE_ROOT = path.resolve(__dirname, 'uploads');
  const uploadedFilePath = path.resolve(SAFE_ROOT, req.file.originalname);
  if (!uploadedFilePath.startsWith(SAFE_ROOT)) {
    return res.status(400).send("Invalid file path.");
  }
  fs.writeFileSync(uploadedFilePath, req.file.buffer);

  res.status(200).send("File uploaded successfully.");
});

app.post("/ufo", (req, res) => {
  const contentType = req.headers["content-type"];

  if (contentType === "application/json") {
    console.log("Received JSON data:", req.body);
    res.status(200).json({ ufo: "Received JSON data from an unknown planet." });
  } else if (contentType === "application/xml") {
    try {
      const parser = sax.parser(true);
      const extractedContent = [];

      parser.onopentag = (node) => {
        if (node.isSelfClosing) {
          extractedContent.push(node.name);
        }
      };

      parser.ontext = (text) => {
        extractedContent.push(text);
      };

      parser.onerror = (error) => {
        throw new Error("Invalid XML: " + error.message);
      };

      parser.write(req.body).close();

      console.log("Received XML data from XMLon:", extractedContent.join(" "));

      // Removed the vulnerable condition for executing commands
      res
        .status(200)
        .set("Content-Type", "text/plain")
        .send(extractedContent.join(" "));
    } catch (error) {
      console.error("XML parsing or validation error:", error.message);
      res.status(400).send("Invalid XML: " + he.encode(error.message));
    }
  } else {
    res.status(405).send("Unsupported content type");
  }
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = server;