# Project Setup Guide

Welcome to our NestJS project. Follow this guide to set up the project environment, including installing dependencies, setting up MongoDB with Docker, configuring environment variables, running migrations, seeding the database, accessing the server, and running tests.

## Installation

### Prerequisites

- Node.js
- Docker
- NPM or Yarn

### Setting Up the Project

1. **Clone the Repository**

   ```bash
   git clone https://yourprojectrepository.git
   cd yourprojectdirectory
   ```

2. **Install Dependencies**

   Run the following command to install the necessary Node.js dependencies:

   ```bash
   npm install
   ```

   Or, if you're using Yarn:

   ```bash
   yarn install
   ```

## Setting Up MongoDB with Docker

1. **Pull MongoDB Image**

   ```bash
   docker pull mongo
   ```

2. **Run MongoDB Container**

   Replace `your_mongo_container` with your preferred container name, and `yourdbname` with your database name:

   ```bash
   docker run --name your_mongo_container -p 27017:27017 -d mongo
   ```

## Configuring .env File

Create a `.env` file in your project root directory and add the following content, adjusting the values according to your setup:

```plaintext
MONGODB_URI=mongodb://localhost:27017/yourdbname
PORT=3000
```

Replace `yourdbname` with your actual database name. The `MONGODB_URI` should point to the MongoDB instance running in your Docker container.

## Running Migrations and Seeding Data

Ensure you have migration and seed scripts set up in your `package.json`. Here is how you might run migrations and seed data:

1. **Run Migrations**

   ```bash
   npm run migrate:up
   ```

2. **Seed Data**

   ```bash
   ts-node seed/seed.ts
   ```

## Accessing the Server

Once everything is set up, you can start the NestJS server by running:

```bash
npm run start
```

The server should now be accessible at `http://localhost:3000/user` (or another port if you configured it differently in your `.env`).

## Running Tests

To run unit and integration tests, execute the following command:

```bash
npm run test
```

## Conclusion

- You should now have a fully functional NestJS environment set up with MongoDB running in a Docker container. If you encounter any issues during setup, please refer to the respective documentation of the tools and technologies used.

## Implementation Ideas
- Create an interface that displays a user list and balance history, allowing for the execution of withdrawals while updating the data.
- Initialize user data with a balance calculated based on the number of days since the user's registration date (specified in the database field) and the type of user (monthly or daily).
- Set up a cron job to run daily balance updates.
- Since testing a cron job can be challenging due to its reliance on real-time, a "Update balances now" button has been added to the interface to test the logic of increasing balances.
- The number of days in a month is calculated based on the actual number of days in the month, rather than using a fixed number like 30.