Store Rating System

Here is how to get this thing running locally. It uses Node.js, MySQL, and React.

1. Database Setup (Do this first!)

Before you run any code, you need to create the database in MySQL. The tables will be created automatically by the code, but the empty database needs to exist.

Open your MySQL terminal or Workbench and run this single command:

CREATE DATABASE roxiller_challenge;


That's it. You don't need to create tables manually; the backend will handle that when it starts.

2. Backend Setup

Go into the backend folder and install the dependencies.

cd backend
npm install


Important: You need to set up your .env file so the app can talk to your database.
Create a file named .env inside the backend folder and paste this in (change the password to your actual MySQL password):

PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_actual_password_here
DB_NAME=roxiller_challenge
JWT_SECRET=super_secret_key_123


Now, start the server:

npm start


If you see "MySQL Connected successfully" and "Server running on port 5000", you are good to go.

3. Frontend Setup

Open a new terminal window (keep the backend running!), go into the frontend folder, and install the libraries.

cd frontend
npm install


Start the React app:

npm run dev


Click the link it gives you (usually http://localhost:5173) to open the app.

4. How to Create an Admin

Since the signup page only creates "Normal Users" (by design), you need to manually promote yourself to Admin to see the dashboard.

Go to the app and Sign Up a new user (e.g., admin@test.com).

Go to your database (MySQL Workbench) and run this SQL command:

UPDATE Users SET role = 'ADMIN' WHERE email = 'admin@test.com';


Log out and log back in. Boom, you are now the System Administrator.

Default Roles

System Administrator: Can create stores, users, and assign owners.

Store Owner: Can see who rated their store.

Normal User: Can search and rate stores.

Project Overview

This project is a full-stack web application designed to handle store ratings with a Role-Based Access Control (RBAC) system. It’s built to solve the problem of managing different types of users—Admins, Store Owners, and Customers—within a single platform.

Architecture

The system follows a standard 3-tier architecture:

Database (MySQL):

This is where all the data lives. We use three main tables: Users, Stores, and Ratings.

We use Sequelize (an ORM) to talk to the database. This means we define our data models in JavaScript (like "A User has a name and email"), and Sequelize automatically generates the SQL code to create tables and manage relationships.

Backend (Node.js & Express):

This is the brain of the operation. It handles the API requests.

Security: It uses bcryptjs to hash passwords (so they aren't stored as plain text) and jsonwebtoken (JWT) to create secure tokens. When you log in, you get a token. The backend checks this token on every request to know who you are and what role you have.

Validation: It enforces strict rules before saving data. For example, it checks if a user's name is between 20-60 characters or if a password has a special character.

Frontend (React + Vite):

This is what the user sees. It's a Single Page Application (SPA).

Dynamic Routing: The navigation bar and accessible pages change based on who is logged in. An Admin sees a dashboard with stats; a Normal User sees a list of stores to rate.

State Management: We use a Context API (AuthContext) to keep track of the logged-in user globally, so the app always knows your role as you navigate between pages.