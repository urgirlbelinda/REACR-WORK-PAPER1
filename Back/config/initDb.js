const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
    try {
        // Step 1: Connect to the MySQL server (without specifying a database yet)
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        // Step 2: Create and use the 'EPMS' database
        await connection.query('CREATE DATABASE IF NOT EXISTS EPMS');
        await connection.query('USE EPMS');

        // Step 3: Create Department table (4 columns)
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Department (
                DepartmentCode VARCHAR(10) PRIMARY KEY,
                DepartmentName VARCHAR(100) NOT NULL,
                GrossSalary DECIMAL(10, 2) NOT NULL,
                TotalDeduction DECIMAL(10, 2) NOT NULL
            )
        `);

        // Step 4: Create Employee table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Employee (
                EmployeeNumber INT AUTO_INCREMENT PRIMARY KEY,
                FirstName VARCHAR(50) NOT NULL,
                LastName VARCHAR(50) NOT NULL,
                Address VARCHAR(255) NOT NULL,
                Position VARCHAR(100) NOT NULL,
                Telephone VARCHAR(20) NOT NULL,
                Gender VARCHAR(10) NOT NULL,
                HiredDate DATE NOT NULL,
                DepartmentCode VARCHAR(10),
                FOREIGN KEY (DepartmentCode) REFERENCES Department(DepartmentCode)
            )
        `);

        // Step 5: Create Salary table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Salary (
                SalaryID INT AUTO_INCREMENT PRIMARY KEY,
                EmployeeNumber INT NOT NULL,
                GrossSalary DECIMAL(10, 2) NOT NULL,
                TotalDeduction DECIMAL(10, 2) NOT NULL,
                NetSalary DECIMAL(10, 2) NOT NULL,
                MonthOfPayment VARCHAR(50) NOT NULL,
                FOREIGN KEY (EmployeeNumber) REFERENCES Employee(EmployeeNumber),
                INDEX idx_employee (EmployeeNumber),
                INDEX idx_month (MonthOfPayment)
            )
        `);

        // Step 6: Create User table for authentication
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS User (
                UserID INT AUTO_INCREMENT PRIMARY KEY,
                Username VARCHAR(50) UNIQUE NOT NULL,
                Password VARCHAR(255) NOT NULL,
                CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Step 7: Insert default departments (Seeding)
        const departments = [
            // [DepartmentCode, DepartmentName, GrossSalary, TotalDeduction] - 4 values
            ['CW', 'Carwash', 300000, 20000],
            ['ST', 'Stock', 200000, 5000],
            ['MC', 'Mechanic', 450000, 40000],
            ['ADMS', 'Administration Staff', 600000, 70000]
        ];

        for (const dept of departments) {
            await connection.execute(
                // FIX APPLIED HERE: Added TotalDeduction to the columns list
                'INSERT IGNORE INTO Department (DepartmentCode, DepartmentName, GrossSalary, TotalDeduction) VALUES (?, ?, ?, ?)',
                dept
            );
        }

        console.log('✅ Database initialized successfully!');
        await connection.end();
    } catch (error) {
        console.error('❌ Error initializing database:', error);
        throw error;
    }
}

module.exports = initializeDatabase;