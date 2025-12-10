
# Customer Ticketing Tool

## Project Overview

The Customer Ticketing Tool is a full-stack web application designed to streamline customer support and incident management. It provides a user-friendly interface for customers to create, track, and manage support tickets, while offering a comprehensive dashboard for support agents and administrators to handle and resolve these tickets efficiently.

## Features

### For Customers

- **Create and Manage Tickets:** Customers can easily create new support tickets, providing details about their issues. They can also view and manage their existing tickets, tracking their status and communication history.
- **Service Catalog:** A browsable catalog of available services, allowing customers to request specific services or report issues related to them.
- **Knowledge Base:** A searchable repository of articles and solutions to common problems, enabling customers to find answers to their questions without needing to create a ticket.
- **Notifications:** Customers receive notifications about updates to their tickets, such as new comments from support agents or changes in ticket status.

### For Support Agents and Admins

- **Role-Based Access Control:** The application supports different user roles, including Customer, Support Agent, and Administrator, with each role having specific permissions and access levels.
- **Ticket Management:** Support agents can view, assign, and manage tickets. They can update ticket statuses, add comments, and resolve issues.
- **Dashboard:** A comprehensive dashboard provides an at-a-glance view of key metrics, such as the number of open, pending, and resolved tickets.
- **User Management:** Administrators can manage user accounts, including creating new users, assigning roles, and resetting passwords.
- **Service and Category Management:** Administrators can manage the service catalog and ticket categories, ensuring that the ticketing system is aligned with the organization's support structure.
- **Reporting and Analytics:** The system provides reporting and analytics capabilities, allowing administrators to track support performance and identify trends.

## Technical Stack

- **Frontend:**
  - React
  - Tailwind CSS
  - Zustand for state management
- **Backend:**
  - Node.js
  - Express.js
  - MySQL for the database
  - JWT for authentication

## Getting Started

### Prerequisites

- Node.js
- MySQL

### Installation and Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/customer-ticketing-tool.git
   cd customer-ticketing-tool
   ```

2. **Backend Setup:**

   - Navigate to the `backend` directory:
     ```bash
     cd backend
     ```
   - Install the dependencies:
     ```bash
     npm install
     ```
   - Set up the database:
     - Create a MySQL database for the application.
     - Update the database connection details in the `.env` file.
     - Run the database schema and seed scripts to create the necessary tables and initial data.
   - Start the backend server:
     ```bash
     npm start
     ```

3. **Frontend Setup:**

   - Navigate to the `frontend` directory:
     ```bash
     cd frontend
     ```
   - Install the dependencies:
     ```bash
     npm install
     ```
   - Start the frontend development server:
     ```bash
     npm start
     ```

4. **Access the application:**

   - Open your web browser and navigate to `http://localhost:3000` to access the application.

## Usage

- **Login:**
  - Customers can register for a new account or log in with their existing credentials.
  - Support agents and administrators can log in with their assigned credentials.
- **Creating a Ticket:**
  - Customers can create a new ticket by providing a subject, description, and selecting a category and service.
- **Managing Tickets:**
  - Customers can view their tickets and their statuses.
  - Support agents can view assigned tickets, update their status, and add comments.
- **Admin Dashboard:**
  - Administrators can access the admin dashboard to manage users, services, and categories, and to view reports and analytics.

## Contributing

Contributions are welcome! If you would like to contribute to the project, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them with descriptive commit messages.
4. Push your changes to your forked repository.
5. Create a pull request to merge your changes into the main repository.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
