var express = require('express');
var fetch = require('node-fetch');
var router = express.Router();

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./jokes.db', sqlite3.OPEN_READWRITE, (err)=> {
  if (err) return console.error(err.message);

  console.log("connection successful")
})

db.run('CREATE TABLE if not exists jokes(id INTEGER PRIMARY KEY, type STRING, setup STRING, punchline STRING)');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title: 'Random Jokes', type: 'loading...', setup: 'loading...'});
  fetch('https://raw.githubusercontent.com/15Dkatz/official_joke_api/master/jokes/index.json')
  .then((response) => response.json())
  .then((data) => {
      data.forEach(async (joke) => {
          db.run('INSERT INTO jokes (type, setup, punchline) VALUES (?, ?, ?);', joke.type, joke.setup, joke.punchline)
      });
  })
});

/* GET random joke. */
router.get('/randomJoke', async function(req, res, next) {
  const joke = db.all("SELECT * FROM jokes ORDER BY RANDOM() LIMIT 1;",(err, row)=>{ 
    res.json(row[0])
  })
})

/* GET joke by id. */
router.get('/joke/:id', async function(req, res, next) {
  const joke = db.all("SELECT * FROM jokes WHERE id = " + req.params.id + " LIMIT 1;",(err, row)=>{ 
    res.json(row[0])
  })
})

module.exports = router;
