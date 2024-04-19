### Puppeteer Project Readme
This project utilizes Puppeteer, a Node library which provides a high-level API to control Chrome or Chromium over the DevTools Protocol. It automates web interactions for web scraping, testing, and other purposes. This README provides an overview of the project structure, usage instructions, and additional notes.

---

### Project Structure

- **index.js**: Entry point of the project. Executes Puppeteer scripts to automate web interactions.
- **methods.js**: Contains functions for logging in and filling out forms using Puppeteer.
- **userDb.js**: Fetches user data from a PostgreSQL database using the `pg` library.
- **dataDb.js**: Retrieves query data from a PostgreSQL database using the `pg` library.
- **utils.js**: Contains utility functions, including parsing connection strings for database connections.
- **customError.js**: Defines a custom error class for handling errors and exiting processes gracefully.
- **package.json**: Contains project metadata and dependencies.
- **node_modules/**: Directory containing project dependencies.
- **README.md**: This file, providing project documentation.

### Usage
#### Running the Project

1. **Run Project**: Execute the main script using Node.js. Use the following command:
    ```bash
    node index.js <user_id> <report_date> "host=localhost;user=<user_db_name>;password=<user_db_password>;database=<db_name>"
    ```
    **Replace the following values:**
    - `<user_id>` with the ID of a person in the database (a number)
    - `<report_date>` with a date in the format yyyy-mm-dd
    - `<user_db_name>` with the username to log into pgAdmin
    - `<user_db_password>` with the password to log into pgAdmin
    - `<db_name>` with the database name to connect to

    This command will execute the Puppeteer script defined in index.js, automating web interactions according to the specified logic.

2. **Create .exe File**: Create an executable file from the project using pkg.
   ```bash
   pkg index.js --target win
   ```
   This command will package the project into an executable file for Windows platforms.

#### Running the Project

1. **Task Scheduler**: Set up a task scheduler to automate the execution of the project. Configure the task to run the executable file with the specified arguments every day at 4:00 AM.

    The command to run the .exe file should be in this format:
    ```
    path/to/executable.exe user_id report_date connection_string
    ```
    - Replace `path/to/executable.exe` with the actual path to the executable file.
    - Replace `user_id` with the ID of the user to search for in the database (a number).
    - Replace `report_date` with the date (yyyy-mm-dd) of the report in the database linked to the specific user.
    - Replace `connection_string` with the connection string in the format:
      ```
      "host=localhost;user=user_db_name;password=user_db_password;database=db_name"
      ```
      - Replace `user_db_name` with the username to log into pgAdmin.
      - Replace `user_db_password` with the password to log into pgAdmin.
      - Replace `db_name` with the database name to connect to.

    This task will automate the execution of the project with the specified arguments at the scheduled time. Ensure that the pgAdmin server is running and connected before running the task.

#### Additional Notes

- **Database Connection**: Ensure that the PostgreSQL database specified in the connection string is correctly configured and accessible.

- **Report Inspection in pgAdmin**: Use SQL queries like `SELECT * FROM logs` in pgAdmin to check reports, especially if they have failed.
  - The `logs` table has columns:
    - `report_id` (ID of the report)
    - `user_id` (user linked to the specific report)
    - `cons_id` (ID linked to the data worked with)
    - `tech_type` (framework which was used)
    - `flag` (indicates if report failed or not)
    - `test_time` (time in which report was filled out)
    - `report_msg` (if success, it's "Report filled out"; otherwise, it contains all elements tags where the data is missing or not it is not in the correct format)
    - `timestamp` (time when the report was inserted)
