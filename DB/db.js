const connection = require('../config/connections.js');

class DB {

    constructor(connection) {
        this.connection = connection;
    }
    

    findAllEmployees() {
        return this.connection.query(
            "SELECT employee.id, employee.first_name, employee.last_name, roles.title, department.depname AS department, roles.salary, LEFT JOIN roles on employee.role_id = roles.id, LEFT JOIN department on roles.department_id = department.id"
        );
    }
    

    createEmployee(employee) {
        return this.connection.query("INSERT INTO employee SET ?", employee);
    }
    

    removeEmployee(employeeId) {
        return this.connection.query(
            "DELETE FROM employee WHERE id = ?",
            employeeId
        );
    }
    

    updateEmployeeRole(employeeId, roleId) {
        return this.connection.query(
            "UPDATE employee SET role_id = ? WHERE id = ?",
            [roleId, employeeId]
        );
    }
    

    findAllRoles() {
        return this.connection.query(
            "SELECT roles.id, roles.title, department.depname AS department, roles.salary FROM roles LEFT JOIN department on roles.department_id = department.id;"
        );
    }
    

    createRole(role) {
        return this.connection.query("INSERT INTO roles SET ?", role);
    }
    

    removeRole(roleId) {
        return this.connection.query("DELETE FROM roles WHERE id = ?", roleId);
    }
    

    findAllDepartments() {
        return this.connection.query(
            "SELECT department.id, department.depname, SUM(roles.salary) AS utilized_budget FROM employee LEFT JOIN roles on employee.role_id = roles.id LEFT JOIN department on roles.department_id = department.id GROUP BY department.id, department.depname;"
        );
    }
    

    createDepartment(department) {
        return this.connection.query("INSERT INTO department SET ?", department);
    }
    

    removeDepartment(departmentId) {
        return this.connection.query(
            "DELETE FROM department WHERE id = ?",
            departmentId
        );
    }
    

    findAllEmployeesByDepartment(departmentId) {
        return this.connection.query(
            "SELECT employee.id, employee.first_name, employee.last_name, roles.title FROM employee LEFT JOIN roles on employee.role_id = roles.id LEFT JOIN department on roles.department_id = department.id WHERE department.id = ?;",
            departmentId
        );
    }
}

module.exports = new DB(connection);