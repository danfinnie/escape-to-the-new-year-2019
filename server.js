// server.js
// where your node app starts

// init project
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const fs = require("fs");
const md5 = require("js-md5");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// init sqlite db
const dbFile = "./.data/sqlite.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(dbFile);

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(() => {
  if (!exists) {
    db.run(
      "CREATE TABLE Gangs (id INTEGER PRIMARY KEY AUTOINCREMENT, gangName TEXT, gangLeader TEXT)"
    );
    console.log("New table Gangs created!");

    // insert default dreams
    db.serialize(() => {
      //db.run(
      //  'INSERT INTO Dreams (dream) VALUES ("Find and count some sheep"), ("Climb a really tall mountain"), ("Wash the dishes")'
      //);
    });
  } else {
    console.log('Database "Gangs" ready to go!');
    db.each("SELECT * from Gangs", (err, row) => {
      if (row) {
        console.log(`record: ${row.gangName} - ${row.gangLeader}`);
      }
    });
  }
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(`${__dirname}/views/index.html`);
});

function hashGang(gang) {
  const normalized =
    gang.gangName.toLowerCase() + "dan" + gang.gangLeader.toLowerCase();
  return md5.hex(normalized);
}

const goodGangs = new Set([
  "fdda4b52b4067339c065a2eca5358e9d",
  "9b380285f0ad4d4552f6e929e36a5941",
  "c4604db15daaa1decef4c016136e5412",
  "8e44442b4b04cbe64d3ac7babbeb4c60"
]);

// endpoint to get all the dreams in the database
app.get("/getGangs", (request, response) => {
  db.all(
    "SELECT * from Gangs order by GangName asc, GangLeader asc",
    (err, rows) => {
      var result = {
        numTotal: goodGangs.size,
        correct: [],
        incorrect: []
      };
      var seenGoodGangs = new Set([]);
      for (const gang of rows) {
        const hashedGang = hashGang(gang);
        if (goodGangs.has(hashedGang) && !seenGoodGangs.has(hashedGang)) {
          result.correct.push(gang);
          seenGoodGangs.add(hashedGang);
        } else {
          result.incorrect.push(gang);
        }
      }
      response.send(JSON.stringify(result));
    }
  );
});

// endpoint to add a dream to the database
app.post("/addGang", (request, response) => {
  console.log(`add to gangs ${JSON.stringify(request.body)}`);

  // DISALLOW_WRITE is an ENV variable that gets reset for new projects so you can write to the database
  if (!process.env.DISALLOW_WRITE) {
    console.log("writing");
    const cleansedGangName = cleanseString(request.body.gangName);
    const cleansedGangLeader = cleanseString(request.body.gangLeader);
    db.run(
      `INSERT INTO Gangs (gangName, gangLeader) VALUES (?, ?)`,
      cleansedGangName,
      cleansedGangLeader,
      error => {
        if (error) {
          response.send({ message: "error!" });
        } else {
          response.send({ message: "success" });
        }
      }
    );
  }
});

// endpoint to clear dreams from the database
app.get("/clearGangs", (request, response) => {
  // DISALLOW_WRITE is an ENV variable that gets reset for new projects so you can write to the database
  if (!process.env.DISALLOW_WRITE) {
    db.each(
      "SELECT * from Gangs",
      (err, row) => {
        console.log("row", row);
        db.run(`DELETE FROM Gangs WHERE ID=?`, row.id, error => {
          if (row) {
            console.log(`deleted row ${row.id}`);
          }
        });
      },
      err => {
        if (err) {
          response.send({ message: "error!" });
        } else {
          response.send({ message: "success" });
        }
      }
    );
  }
});

// helper function that prevents html/css/script malice
const cleanseString = function(string) {
  return string.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

// listen for requests :)
var listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
