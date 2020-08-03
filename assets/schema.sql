DROP DATABASE IF EXISTS business_DB;

CREATE DATABASE business_DB;

USE business_DB;

CREATE TABLE department (
    id int AUTO_INCREMENT,
    name VARCHAR(30),
    PRIMARY KEY (id)
);

CREATE TABLE role (
    id int AUTO_INCREMENT,
    title VARCHAR(30),
    salary decimal,
    department_id int,
    PRIMARY KEY (id),
    FOREIGN KEY (department_id) REFERENCES department(id)
);

CREATE TABLE employee (
    id int AUTO_INCREMENT,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    role_id int,
    manager_id int,
    PRIMARY KEY (id),
    FOREIGN KEY (role_id) REFERENCES role(id),
    FOREIGN KEY (manager_id) REFERENCES employee(id)
);


-- Insert a set of records.

-- three values for department
INSERT INTO department (name) VALUES ("Finance");
INSERT INTO department (name) VALUES ("Legal");
INSERT INTO department (name) VALUES ("Engineering");

-- three values for role
INSERT INTO role (title, salary, department_id) VALUES ("Sales", 60000, 1);
INSERT INTO role (title, salary, department_id) VALUES ("Head Of Sales", 100000, 1);
INSERT INTO role (title, salary, department_id) VALUES ("Lawyer", 75000, 2);
INSERT INTO role (title, salary, department_id) VALUES ("Senior Lawyer", 150000, 2);
INSERT INTO role (title, salary, department_id) VALUES ("Software Engineer", 90000, 3);
INSERT INTO role (title, salary, department_id) VALUES ("Lead Engineer", 120000, 3);

-- three values for 
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Kelly", "Koops", 2, null);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("James", "Johnson", 1, 1);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Cassie", "Cinders", 4, null);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Billy", "Boston", 3, 3);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Steven", "Strange", 6, null);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Daisy", "Duke", 5, 5);
