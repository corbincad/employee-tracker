const { prompt } = require('inquirer');
const db = require('./DB/db.js');
require('console.table');


async function firstPrompt() {
    const { choice } = await prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'What are you wanting to do?',
            choices: [
                {
                    name: 'view all employees',
                    value: 'view_employees'
                },
                {
                    name: 'view all employees by department',
                    value: 'view_employees_by_department'
                },
                {
                    name: 'add employee',
                    value: 'add_employee'
                },
                {
                    name: 'remove employee',
                    value: 'remove employee'
                },
                {
                    name: "update employee's role",
                    value: 'update_employee_role'
                },
                {
                    name: 'view all roles',
                    value: 'view_roles'
                },
                {
                    name: 'add role',
                    value: 'add_role'
                },
                {
                    name: 'remove role',
                    value: 'remove_role'
                },
                {
                    name: 'view all departments',
                    value: 'view_departments'
                },
                {
                    name: 'add department',
                    value: 'add_department'
                },
                {
                    name: 'remove department',
                    value: 'remove_department'
                },
                {
                    name: 'quit',
                    value: 'quit'
                }
            ]
        }
    ])

    switch (choice) {
        case 'view_employees':
            return viewEmployees();
        case 'view_employees_by_department':
            return viewEmployeesByDepartment();
        case 'add_employee':
            return addEmployee();
        case 'remove_employee':
            return removeEmployee();
        case 'update_employee_role':
            return updateEmployeeRole();
        case 'view_roles':
            return viewRoles();
        case 'add_role':
            return addRole();
        case 'remove_role':
            return removeRole();
        case 'view_departments':
            return viewDepartments();
        case 'add_department':
            return addDepartment();
        case 'remove_department':
            return removeDepartment();
        default:
            return quit();
    }
}


async function viewEmployees() {
    const employees = await db.findAllEmployees();
    console.log("\n");
    console.table(employees);
    firstPrompt();
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
    firstPrompt();
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
    firstPrompt();
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
    firstPrompt();
}
async function viewRoles() {
    const roles = await db.findAllRoles();
    console.log("\n");
    console.table(roles);
    firstPrompt();
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
    firstPrompt();
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
    firstPrompt();
}
async function viewDepartments() {
    const departments = await db.findAllDepartments();
    console.log("\n");
    console.table(departments);
    firstPrompt();
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
    firstPrompt();
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
    firstPrompt();
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
    
    await db.createEmployee(employee);
    console.log(
        `Added ${employee.first_name} ${employee.last_name} to the database`
    );
    firstPrompt();
}
function quit() {
    console.log("Goodbye!");
    process.exit();
}

firstPrompt();