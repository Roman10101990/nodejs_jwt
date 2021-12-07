const express = require("express");
const app = express();
let port = process.env.port || 3000;
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const Joi = require("joi");

const urlencodedParser = express.urlencoded({ extended: false });
app.use(express.json());

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "", //your database
  password: "" // your password
});

const schema = Joi.object({
  first_name: Joi.string()
    .alphanum()
    .required(),
  last_name: Joi.string().alphanum(),
  email: Joi.string()
    .email({ minDomainSegments: 1, tlds: { allow: ["com", "net"] } })
    .required(),
  phone: Joi.number().integer()
});

app.post("/users", urlencodedParser, function(req, res) {
  if (!req.body) return res.sendStatus(400).send("No exist user");
  const id = req.body.id;
  const first_name = schema.validate(req.body.first_name);
  const last_name = schema.validate(req.body.last_name);
  const email = schema.validate(req.body.email);
  const phone = schema.validate(req.body.phone);
  const password = req.body.password;

  bcrypt.hash(password, 10, function(err, hash) {
    pool.query(
      "INSERT INTO users(id, first_name, last_name, email, phone, password) VALUES(?,?,?,?,?,?)",
      [id, first_name, last_name, email, phone, hash],
      function(err, data) {
        if (err) return console.log(err);
        res.send("success added data");
      }
    );
  });
});

app.get("/users/:id", function(req, res) {
  const id = req.params.id;
  pool.query("SELECT * FROM users WHERE id=?", [id], function(err, data) {
    if (err) return console.log(err);
    res.send(data);
  });
});

app.put("/users/:id", function(req, res) {
  if (!req.body) return res.sendStatus(400);
  const id = req.body.id;
  const first_name = schema.validate(req.body.first_name);
  const last_name = schema.validate(req.body.last_name);
  const email = schema.validate(req.body.email);
  const phone = schema.validate(req.body.phone);
  const password = req.body.password;

  pool.query(
    "UPDATE users SET first_name=?, last_name=?, email=?, phone=?, password=? WHERE id=?",
    [first_name, last_name, email, phone, password, id],
    function(err, data) {
      if (err) return console.log(err);
      res.send(data);
    }
  );
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
