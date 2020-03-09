const util = require('util');
const mySql = require('mysql');
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "MilohReese!1",
    database: "Homework_DB",
});
connection.connect()
connection.query = util.promisify(connection.query)

class DB {
    // Keeping a reference to the connection on the class in case we need it later
    constructor(connection) {
        this.connection = connection;
    }
    // Find all employees, join with roles and departments to display their roles, salaries, departments, and managers
    findAllEmployees() {
        return this.connection.query(
            "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id;"
        );
    }
    // Find all employees except the given employee id
    findAllPossibleManagers(employeeId) {
        return this.connection.query(
            "SELECT id, first_name, last_name FROM employee WHERE id != ?",
            employeeId
        );
    }
    // Create a new employee
    createEmployee(employee) {
        return this.connection.query("INSERT INTO employee SET ?", employee);
    }
    // Remove an employee with the given id
    removeEmployee(employeeId) {
        return this.connection.query(
            "DELETE FROM employee WHERE id = ?",
            employeeId
        );
    }
    // Update the given employee's role
    updateEmployeeRole(employeeId, roleId) {
        return this.connection.query(
            "UPDATE employee SET role_id = ? WHERE id = ?",
            [roleId, employeeId]
        );
    }
    // Update the given employee's manager
    updateEmployeeManager(employeeId, managerId) {
        return this.connection.query(
            "UPDATE employee SET manager_id = ? WHERE id = ?",
            [managerId, employeeId]
        );
    }
    // Find all roles, join with departments to display the department name
    findAllRoles() {
        return this.connection.query(
            "SELECT role.id, role.title, department.name AS department, role.salary FROM role LEFT JOIN department on role.department_id = department.id;"
        );
    }
    // Create a new role
    createRole(role) {
        return this.connection.query("INSERT INTO role SET ?", role);
    }
    // Remove a role from the db
    removeRole(roleId) {
        return this.connection.query("DELETE FROM role WHERE id = ?", roleId);
    }
    // Find all departments, join with employees and roles and sum up utilized department budget
    findAllDepartments() {
        return this.connection.query(
            "SELECT department.id, department.name, SUM(role.salary) AS utilized_budget FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id GROUP BY department.id, department.name;"
        );
    }
    // Create a new department
    createDepartment(department) {
        return this.connection.query("INSERT INTO department SET ?", department);
    }
    // Remove a department
    removeDepartment(departmentId) {
        return this.connection.query(
            "DELETE FROM department WHERE id = ?",
            departmentId
        );
    }
    // Find all employees in a given department, join with roles to display role titles
    findAllEmployeesByDepartment(departmentId) {
        return this.connection.query(
            "SELECT employee.id, employee.first_name, employee.last_name, role.title FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department department on role.department_id = department.id WHERE department.id = ?;",
            departmentId
        );
    }
    // Find all employees by manager, join with departments and roles to display titles and department names
    findAllEmployeesByManager(managerId) {
        return this.connection.query(
            "SELECT employee.id, employee.first_name, employee.last_name, department.name AS department, role.title FROM employee LEFT JOIN role on role.id = employee.role_id LEFT JOIN department ON department.id = role.department_id WHERE manager_id = ?;",
            managerId
        );
    }
}
module.exports = new DB(connection);

const { prompt } = require("inquirer");
const db = require("./db");
require("console.table");
async function loadMainPrompts() {
    const { choice } = await prompt([
        {
            type: "list",
            name: "choice",
            message: "What would you like to do?",
            choices: [
                {
                    name: "View All Employees",
                    value: "VIEW_EMPLOYEES"
                },
                {
                    name: "View All Employees By Department",
                    value: "VIEW_EMPLOYEES_BY_DEPARTMENT"
                },
                {
                    name: "View All Employees By Manager",
                    value: "VIEW_EMPLOYEES_BY_MANAGER"
                },
                {
                    name: "Add Employee",
                    value: "ADD_EMPLOYEE"
                },
                {
                    name: "Remove Employee",
                    value: "REMOVE_EMPLOYEE"
                },
                {
                    name: "Update Employee Role",
                    value: "UPDATE_EMPLOYEE_ROLE"
                },
                {
                    name: "Update Employee Manager",
                    value: "UPDATE_EMPLOYEE_MANAGER"
                },
                {
                    name: "View All Roles",
                    value: "VIEW_ROLES"
                },
                {
                    name: "Add Role",
                    value: "ADD_ROLE"
                },
                {
                    name: "Remove Role",
                    value: "REMOVE_ROLE"
                },
                {
                    name: "View All Departments",
                    value: "VIEW_DEPARTMENTS"
                },
                {
                    name: "Add Department",
                    value: "ADD_DEPARTMENT"
                },
                {
                    name: "Remove Department",
                    value: "REMOVE_DEPARTMENT"
                },
                {
                    name: "Quit",
                    value: "QUIT"
                }
            ]
        }
    ]);
    // Call the appropriate function depending on what the user chose
    switch (choice) {
        case "VIEW_EMPLOYEES":
            return viewEmployees();
        case "VIEW_EMPLOYEES_BY_DEPARTMENT":
            return viewEmployeesByDepartment();
        case "VIEW_EMPLOYEES_BY_MANAGER":
            return viewEmployeesByManager();
        case "ADD_EMPLOYEE":
            return addEmployee();
        case "REMOVE_EMPLOYEE":
            return removeEmployee();
        case "UPDATE_EMPLOYEE_ROLE":
            return updateEmployeeRole();
        case "UPDATE_EMPLOYEE_MANAGER":
            return updateEmployeeManager();
        case "VIEW_DEPARTMENTS":
            return viewDepartments();
        case "ADD_DEPARTMENT":
            return addDepartment();
        case "REMOVE_DEPARTMENT":
            return removeDepartment();
        case "VIEW_ROLES":
            return viewRoles();
        case "ADD_ROLE":
            return addRole();
        case "REMOVE_ROLE":
            return removeRole();
        default:
            return quit();
    }
}
async function viewEmployees() {
    const employees = await db.findAllEmployees();
    console.log("\n");
    console.table(employees);
    loadMainPrompts();
}
async function viewEmployeesByDepartment() {
    const departments = await db.findAllDepartments();
    const departmentChoices = departments.map(({ id, name }) => ({
        name: name,
        value: id
    }));
    const { departmentId } = await prompt([
        {
            type: "list",
            name: "departmentId",
            message: "Which department would you like to see employees for?",
            choices: departmentChoices
        }
    ]);
    const employees = await db.findAllEmployeesByDepartment(departmentId);
    console.log("\n");
    console.table(employees);
    loadMainPrompts();
}
async function viewEmployeesByManager() {
    const managers = await db.findAllEmployees();
    const managerChoices = managers.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id
    }));
    const { managerId } = await prompt([
        {
            type: "list",
            name: "managerId",
            message: "Which employee do you want to see direct reports for?",
            choices: managerChoices
        }
    ]);
    const employees = await db.findAllEmployeesByManager(managerId);
    console.log("\n");
    if (employees.length === 0) {
        console.log("The selected employee has no direct reports");
    } else {
        console.table(employees);
    }
    loadMainPrompts();
}
async function removeEmployee() {
    const employees = await db.findAllEmployees();
    const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id
    }));
    const { employeeId } = await prompt([
        {
            type: "list",
            name: "employeeId",
            message: "Which employee do you want to remove?",
            choices: employeeChoices
        }
    ]);
    await db.removeEmployee(employeeId);
    console.log("Removed employee from the database");
    loadMainPrompts();
}
async function updateEmployeeRole() {
    const employees = await db.findAllEmployees();
    const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id
    }));
    const { employeeId } = await prompt([
        {
            type: "list",
            name: "employeeId",
            message: "Which employee's role do you want to update?",
            choices: employeeChoices
        }
    ]);
    const roles = await db.findAllRoles();
    const roleChoices = roles.map(({ id, title }) => ({
        name: title,
        value: id
    }));
    const { roleId } = await prompt([
        {
            type: "list",
            name: "roleId",
            message: "Which role do you want to assign the selected employee?",
            choices: roleChoices
        }
    ]);
    await db.updateEmployeeRole(employeeId, roleId);
    console.log("Updated employee's role");
    loadMainPrompts();
}
async function updateEmployeeManager() {
    const employees = await db.findAllEmployees();
    const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id
    }));
    const { employeeId } = await prompt([
        {
            type: "list",
            name: "employeeId",
            message: "Which employee's manager do you want to update?",
            choices: employeeChoices
        }
    ]);
    const managers = await db.findAllPossibleManagers(employeeId);
    const managerChoices = managers.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id
    }));
    const { managerId } = await prompt([
        {
            type: "list",
            name: "managerId",
            message:
                "Which employee do you want to set as manager for the selected employee?",
            choices: managerChoices
        }
    ]);
    await db.updateEmployeeManager(employeeId, managerId);
    console.log("Updated employee's manager");
    loadMainPrompts();
}
async function viewRoles() {
    const roles = await db.findAllRoles();
    console.log("\n");
    console.table(roles);
    loadMainPrompts();
}
async function addRole() {
    const departments = await db.findAllDepartments();
    const departmentChoices = departments.map(({ id, name }) => ({
        name: name,
        value: id
    }));
    const role = await prompt([
        {
            name: "title",
            message: "What is the name of the role?"
        },
        {
            name: "salary",
            message: "What is the salary of the role?"
        },
        {
            type: "list",
            name: "department_id",
            message: "Which department does the role belong to?",
            choices: departmentChoices
        }
    ]);
    await db.createRole(role);
    console.log(`Added ${role.title} to the database`);
    loadMainPrompts();
}
async function removeRole() {
    const roles = await db.findAllRoles();
    const roleChoices = roles.map(({ id, title }) => ({
        name: title,
        value: id
    }));
    const { roleId } = await prompt([
        {
            type: "list",
            name: "roleId",
            message:
                "Which role do you want to remove? (Warning: This will also remove employees)",
            choices: roleChoices
        }
    ]);
    await db.removeRole(roleId);
    console.log("Removed role from the database");
    loadMainPrompts();
}
async function viewDepartments() {
    const departments = await db.findAllDepartments();
    console.log("\n");
    console.table(departments);
    loadMainPrompts();
}
async function addDepartment() {
    const department = await prompt([
        {
            name: "name",
            message: "What is the name of the department?"
        }
    ]);
    await db.createDepartment(department);
    console.log(`Added ${department.name} to the database`);
    loadMainPrompts();
}
async function removeDepartment() {
    const departments = await db.findAllDepartments();
    const departmentChoices = departments.map(({ id, name }) => ({
        name: name,
        value: id
    }));
    const { departmentId } = await prompt({
        type: "list",
        name: "departmentId",
        message:
            "Which department would you like to remove? (Warning: This will also remove associated roles and employees)",
        choices: departmentChoices
    });
    await db.removeDepartment(departmentId);
    console.log(`Removed department from the database`);
    loadMainPrompts();
}
async function addEmployee() {
    const roles = await db.findAllRoles();
    const employees = await db.findAllEmployees();
    const employee = await prompt([
        {
            name: "first_name",
            message: "What is the employee's first name?"
        },
        {
            name: "last_name",
            message: "What is the employee's last name?"
        }
    ]);
    const roleChoices = roles.map(({ id, title }) => ({
        name: title,
        value: id
    }));
    const { roleId } = await prompt({
        type: "list",
        name: "roleId",
        message: "What is the employee's role?",
        choices: roleChoices
    });
    employee.role_id = roleId;
    const managerChoices = employees.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id
    }));
    managerChoices.unshift({ name: "None", value: null });
    const { managerId } = await prompt({
        type: "list",
        name: "managerId",
        message: "Who is the employee's manager?",
        choices: managerChoices
    });
    employee.manager_id = managerId;
    await db.createEmployee(employee);
    console.log(
        `Added ${employee.first_name} ${employee.last_name} to the database`
    );
    loadMainPrompts();
}
function quit() {
    console.log("Goodbye!");
    process.exit();
}