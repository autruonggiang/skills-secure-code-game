// Contribute new levels to the game in 3 simple steps!
// Read our Contribution Guideline at github.com/skills/secure-code-game/blob/main/CONTRIBUTING.md

const express = require("express");
const bodyParser = require("body-parser");
const sax = require("sax");
const multer = require("multer");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.text({ type: "application/xml" }));

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/ufo/upload", upload.single("file"), (req, res) => {
  return res.status(501).send("Not Implemented.");
  // We don't need this feature/endpoint, it's a backdoor! 
  // Removing this prevents an attacker to perform a Remote Code Execution
  // by uploading a file with a .admin extension that is then executed on the server.
  // The best code is less code. If you don't need something, don't include it.
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
        console.error("XML parsing error:", error);
        res.status(400).send("Invalid XML");
      };

      parser.onend = () => {
        const xmlString = extractedContent.join(" ");
        if (xmlString.includes('SYSTEM "') && xmlString.includes(".admin")) {
          res.status(400).send("Invalid XML");
        } else {
          res
            .status(200)
            .set("Content-Type", "text/plain")
            .send(xmlString);
        }
      };

      parser.write(req.body).close();
    } catch (error) {
      console.error("XML parsing or validation error");
      res.status(400).send("Invalid XML");
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

// Solution explanation:

// Parsing data can cause XXE (XML External Entity) vulnerabilities due to the way XML
// documents are processed allowing attackers to inject malicious external entities.

// To fix this issue, we need to edit the XMLParseOptions to:
// - Disable the option to replace XML entities (replaceEntities: false)
// - Disable the parser to recover from certain parsing errors (recover: false)
// - Disabled network access when parsing (nonet: true)

// Trusting client inputs in any form (request body, query parameter or uploaded file data)
// can be really dangerous and even lead to a Remote Code Execution (RCE) vulnerability.

// To fix this issue, we need to:
// - Remove the unnecessary file upload endpoint that allows you to upload any filetypes
// - Remove the feature that executes a command on the server coming from a file
// with the .admin extension parsed as an XML "SYSTEM" entity.