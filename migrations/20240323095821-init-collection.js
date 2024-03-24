module.exports = {
  async up(db, client) {
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
    await db.createCollection('users');
    await db.command({
      collMod: "users",
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["name", "email", "employeeType", "startDate", "balance"],
          properties: {
            name: {
              bsonType: "string",
              description: "must be a string and is required"
            },
            email: {
              bsonType: "string",
              description: "must be a string and is required"
            },
            baseSalary: {
              bsonType: "double",
              description: "must be a double"
            },
            dailyRate: {
              bsonType: "double",
              description: "must be a double"
            },
            employeeType: {
              bsonType: "string",
              description: "must be a string and is required"
            },
            startDate: {
              bsonType: "date",
              description: "must be a date and is required"
            },
            balance: {
              bsonType: "double",
              description: "must be a double and is required"
            },
          }
        }
      },
      validationAction: "warn"
    });

    await db.createCollection('balance_histories');
    await db.command({
      collMod: 'balance_histories',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ["userId", 'amount', 'date', 'description'],
          properties: {
            userId: {
              bsonType: "objectId"
            },
            amount: {
              bsonType: 'double',
              description: 'must be a double and is required',
            },
            date: {
              bsonType: 'date',
              description: 'must be a date and is required',
            },
            description: {
              bsonType: 'string',
            },
          },
        },
      },
      validationAction: 'warn',
    });
  },

  async down(db, client) {
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
