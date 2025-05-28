const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");
const express = require("express");
const app = express();
const { v4: uuidv4 } = require("uuid");
const path = require("path");
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");
let methodoverride = require("method-override");
app.use(methodoverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "aditi1",
  database: "delta_app",
});

let port = 3000;

app.listen(port, () => {
  console.log("Server Started");
});

app.get("/", (req, res) => {
  let q = "select count(*) from users";
  connection.query(q, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      let count = result[0]["count(*)"];
      res.render("home.ejs", { count });
    }
  });
});

app.get("/users", (req, res) => {
  let q = "select * from users";
  connection.query(q, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.render("show.ejs", { result });
    }
  });
});

app.get("/users/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `select * from users where id = '${id}'`;
  connection.query(q, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      let user = result[0];
      res.render("edit.ejs", { user });
    }
  });
});

app.patch("/users/:id/edit", (req, res) => {
  let { id } = req.params;
  let { password: formPass, username: formUser } = req.body;
  let q = `select * from users where id = '${id}'`;
  connection.query(q, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      let user = result[0];
      if (user.password != formPass) {
        res.send("Wrong password!");
      } else {
        let q2 = `update users set username='${formUser}' where id = '${id}'`;
        connection.query(q2, (err, result) => {
          if (err) {
            console.log(err);
          }
          res.redirect("/users");
        });
      }
    }
  });
});
app.get("/users/join", (req, res) => {
  res.render("join.ejs");
});

app.post("/users/join", (req, res) => {
  let id = uuidv4();
  let { user, email, pass } = req.body;
  let data = [id, user, email, pass];
  let q = "insert into users (id,username,email,password) values (?,?,?,?)";
  connection.query(q, data, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/users");
    }
  });
});
app.get("/users/delete", (req, res) => {
  res.render("delete.ejs");
});

app.delete("/users", (req, res) => {
  let { email, pass } = req.body;
  let q = `delete from users where email = ? and password = ?`;
  connection.query(q, [email, pass], (err, result) => {
    if (err) {
      console.log(err);
      res.send("Password or email do not match");
    } else {
      res.redirect("/users");
    }
  });
});
