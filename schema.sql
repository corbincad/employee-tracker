drop database if exists employee_tracker_db;

create database employee_tracker_db;

use employee_tracker_db;

create table department(
    id int auto_increment,
    depname varchar(30) not NULL,
    primary key(id)
);

create table roles(
    id int auto_increment,
    title varchar(30) not null,
    salary decimal(10,2) not null,
    department_id int,
    primary key(id)
);

create table employee(
    id int auto_increment,
    first_name varchar(30) not null,
    last_name varchar(30) not null,
    role_id int,
    primary key(id)
);