// Dependencies
const express = require("express");
const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require('console.table');
const fs = require("fs");

let header = "";
fs.readFile("assets/headerArt.txt", "utf-8", (err, data) => {
  if (err) throw err;
  header = data;
});

// MySQL DB Connection Information (remember to change this with our specific credentials)
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.HOST,
    port: 3306,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});


// require  dotenv.config to use the .env file containing all the secrets
// use process.env. for accessing the variable key

async function logic() {
  try {
    let userSelection = await promptUser(
      "userChoice", 
      "What would you like to do?", 
      "list",
      [
        "View Employees",
        "View Departments",
        "View Roles",
        new inquirer.Separator(),
        "Add Employee",
        "Add Department",
        "Add Role",
        new inquirer.Separator(),
        "Update Role Of Employee",
        new inquirer.Separator(),
        "Exit",
        new inquirer.Separator(),
      ]
    );
  
    switch (userSelection.userChoice) {
      case "View Employees":
        console.clear();
        console.log(header)
        connection.query(viewEmployees(), (err,res) => {
          console.table(res);
          logic();
        })
        break;

      case "View Departments":
        console.clear();
        connection.query(viewDepartments(), (err, res) => {
          console.table(res);
          logic();
        })
          break;

      case "View Roles":
        console.clear();
        connection.query(viewRoles(), (err, res) => {
          console.table(res);
          logic();
        })
        break;
        
      case "Add Employee":
        
          break;
      case "Add Department":

        break;
        
      case "Add Role":
        
          break;

      case "Update Role Of Employee":
    
        break;
        
      case "Exit":
        connection.end();
        break;
    }
  }
    catch {

    }
}


function promptUser(promptName, promptMessage, promptType, promptChoices) {
  return inquirer
  .prompt([
      {
          name: promptName,
          message: promptMessage,
          type: promptType,
          choices: promptChoices
      }
  ])
};

let myFirstPromise = new Promise((resolve, reject) => {
  resolve("we have success");
});

myFirstPromise.then(() => {
  // Initiate MySQL Connection.
  connection.connect(function(err) {
  if (err) throw err;
  logic();
  });
});


function viewEmployees() {
  return `SELECT e.id, CONCAT(e.first_name, ' ', e.last_name) AS 'Employee', d.name AS 'Department', r.title AS 'Title', r.salary AS 'Salary', CONCAT(m.first_name, ' ', m.last_name) AS 'Manager'
  FROM employee e
      LEFT JOIN employee m ON m.id = e.manager_id
      LEFT JOIN role r ON e.role_id = r.id
      LEFT JOIN department d ON d.id = r.department_id
  ORDER BY e.id;`
} 

function viewDepartments() {
  return  `SELECT name FROM department;`
};


function viewRoles() {
  return `SELECT title, salary, department_id FROM role ORDER BY title;`
}
