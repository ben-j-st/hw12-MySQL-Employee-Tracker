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



// read file and pass actual header data to the new variable 
fs.readFile("assets/headerArt.txt", "utf-8", (err, data) => {
  if (err) throw err;
  header = data;
});

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
      roleList.push({
        value: data[i].id,
        name: data[i].title
      })
    };
  })
}

function updateDepartmentList() {
  departList.length = 0;
  connection.query(viewDepartments(), (err, data) => {
    for(let i = 0; i < data.length; i++) {
      departList.push({
        value: data[0].id,
        name: data[i].name
      })
    };
  });
}

function updateEmployeeList() {
  employeeList.length = 0;
  employeeList.push("Null");
  connection.query(viewEmployees(), (err, data) => {
    for(let i = 0; i < data.length; i++) {
      employeeList.push({
        value: data[i].id,
        name: data[i].Employee
      })
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
        "Update An Employees Manager",
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
        
         
        //  
        await connection.query(addEmployee(firstName.firstName, lastName.lastName, selectRole.eTitle, manager.mName), (err, res) => {
          console.log("Successfully added a new employee");
        })
        updateEmployeeList();
        logic();
          break;

      case "Add Department":
        let newDepartment = await promptUser(
          "dName",
          "Please Enter New Department Name: ",
          "prompt",
          []
        );
          await connection.query(addDepartment(newDepartment.dName), (err) => {
            console.log("successfully added a new department")
          })
          updateDepartmentList();
          logic();
        break;
        
      case "Add Role":
        let newTitle = await promptUser( 
          "title",
          "Enter new Profession / Title",
          "prompt",
          []
        );

        let newSalary = await promptUser(
          "salary",
          "Enter the salary for the new position",
          "prompt",
          []
        )

        let departmentID = await promptUser(
          "depID",
          "Please Choose the department",
          "list",
          departList
        )

        await connection.query(addRole(
          newTitle.title, 
          newSalary.salary, 
          departmentID.depID
        ), (err) => {

        })
        updateRoleList();
        logic();
          break;

      case "Update Role Of Employee":
         let employeeUpdate = await promptUser(
           "employeeID",
           "Which employee would you like update",
           "list",
           employeeList
         );

         let roleUpdate = await promptUser(
          "roleID",
          "Please select employee's new role",
          "list",
          roleList
         );

        let updateDepID = await promptUser(
          "updateDepID",
          "Please Choose The New Department",
          "list",
          departList
        )

         connection.query(updateRole(
           employeeUpdate.employeeID,
           roleUpdate.roleID,
           updateDepID.updateDepID
        ), (err) => {
           })
           updateRoleList();
        logic();
        break;

      case "Update An Employees Manager":
        let employUpdate = await promptUser(
          "employeeID",
          "Which employee would you like update",
          "list",
          employeeList
        );

        let managerUpdate = await promptUser(
          "managerID",
          "Please select employee's new manager",
          "list",
          employeeList
        );

        connection.query(updateManager(
          employUpdate.employeeID,
          managerUpdate.managerID), (err) => {
        })

        logic();
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
  return  `SELECT id, name FROM department;`
};


function viewRoles() {
  return `SELECT id, title, salary, department_id FROM role ORDER BY title;`
}

function addEmployee(first, last, roleID, managerID) {
  return `INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("${first}", "${last}", ${roleID}, ${managerID});`;
};

function addRole(title, salary, department_id) {
  return `INSERT INTO role (title, salary, department_id)
  VALUES ("${title}", ${salary}, ${department_id});`;
};

function addDepartment(name) {
  return `INSERT INTO department (name) VALUES("${name}");`;
};

function updateRole(employeeID, roleID) {
  return `UPDATE employee SET role_id= ${roleID} WHERE id = ${employeeID};`;
}

function updateManager(employeeID, managerID, departmentID) {
  // reversed the employee id and manager id, so that you update the mangers, manager_id col
  return `UPDATE employee SET manager_id = ${managerID}, department_id = ${departmentID}  where id = ${employeeID}`
}


