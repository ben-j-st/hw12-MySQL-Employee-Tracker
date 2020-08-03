// Dependencies
const express = require("express");
const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require('console.table');
const fs = require("fs");



// create variable to hold header
let header = "";

//variables to hold lists
const roleList = [];
const departList = [];
const employeeList = [];
// const employeeObj = {};
let tempRoleId = 0;
let tempManagerID = 0;


// read file and pass actual header data to the new variable 
fs.readFile("assets/headerArt.txt", "utf-8", (err, data) => {
  if (err) throw err;
  header = data;
});

function clearAndEmployeeTable() {
  console.clear();
  connection.query(viewEmployees(), (err, res) => {
    if (err) throw err
    console.table(res)
    console.log("\n")
  })
}
// MySQL DB Connection Information (remember to change this with our specific credentials)
// require  dotenv.config to use the .env file containing all the secrets
// use process.env. for accessing the variable key
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.HOST,
    port: 3306,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

function updateRoleList() {
  roleList.length = 0;
  connection.query(viewRoles(), (err, data) => {
    for(let i = 0; i < data.length; i++) {
      roleList.push(data[i].title)
    };
  })
}

function updateDepartmentList() {
  departList.length = 0;
  connection.query(viewDepartments(), (err, data) => {
    for(let i = 0; i < data.length; i++) {
      departList.push(data[i].name)
    };
  });
}

function updateEmployeeList() {
  employeeList.length = 0;
  employeeList.push("Null");
  connection.query(viewEmployees(), (err, data) => {
    for(let i = 0; i < data.length; i++) {
      employeeList.push(data[i].Employee)
    };
  });
}


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
        connection.query(viewEmployees(), (err,res) => {
          console.table(res);
          logic();
        })
        break;

      case "View Departments":
        connection.query(viewDepartments(), (err, res) => {
          console.table(res);
          logic();
        })
          break;

      case "View Roles":
        connection.query(viewRoles(), (err, res) => {
          console.table(res);
          logic();
        })
        break;
        
      case "Add Employee":
        let firstName = await promptUser(
          "firstName",
          "Enter Employees First Name:",
          "prompt",
          []
        );

        let lastName = await promptUser(
          "lastName",
          "Enter Employees Last Name:",
          "prompt",
          []
        )

        let selectRole = await promptUser(
          "eTitle",
          "Choose Job Title",
          "list",
          roleList
        )

        let manager = await promptUser(
          "mName",
          "Select Manager If Employee Has One or Null if not",
          "list",
          employeeList
        )
          await connection.query(getRoleID(selectRole.eTitle), (err, data) => {
            tempRoleId = data[0].id
          })
         

         if (manager.mName === "Null") {
           tempManagerID = "Null"
         } else {
          await connection.query(getManagerID(manager.mName), (err, data) => {
            tempManagerID = data[0].id
            // console.log(tempManagerID)
          })
         }  
         
        //  
        await connection.query(addEmployee(firstName.firstName, lastName.lastName, tempRoleId, tempManagerID), (err, res) => {
          // if (err) throw err;
          if (err) console.log(err)
          console.log(res);
          // console.log("Successfully added a new employee");
        })
        logic();
          break;

      case "Add Department":
        let newDepartment = await promptUser(
          "dName",
          "Please Enter New Department Name: ",
          "prompt",
          []
        );
          await connection.query(addDepartment(newDepartment.dName), (err, res) => {
            // if (err) throw err;
            console.log("successfully added a new department")
          }) 
          logic();
        break;
        
      case "Add Role":
        
          break;

      case "Update Role Of Employee":
        clearAndHeader();
    
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
  updateRoleList();
  updateDepartmentList();
  updateEmployeeList();
  console.log(header);
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

function addEmployee(first, last, roleid, managerid) {
  return `INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("${first}", "${last}", ${roleid}, ${managerid});`;
};

function addRole(title, salary, department_id) {
  return `INSERT INTO role (title, salary, department_id)
  VALUES ("${title}", ${salary}, ${department_id});`;
};

function addDepartment(name) {
  return `INSERT INTO department (name) VALUES("${name}");`;
};

function getRoleID(title) {
  return `SELECT id from role where title = "${title}";`;
}

function getManagerID(managerName) {
 return `SELECT e.id, CONCAT(e.first_name, ' ', e.last_name) AS 'Employee', d.name AS 'Department', r.title AS 'Title', r.salary AS 'Salary', CONCAT(m.first_name, ' ', m.last_name) AS 'Manager'
  FROM employee e
      LEFT JOIN employee m ON m.id = e.manager_id
      LEFT JOIN role r ON e.role_id = r.id
      LEFT JOIN department d ON d.id = r.department_id
      WHERE CONCAT(m.first_name, ' ', m.last_name) = "${managerName}"
  ORDER BY e.id;`
}