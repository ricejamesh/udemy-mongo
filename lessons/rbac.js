// Lesson 198. Creating a user.

// switch to admin database
use admin;

// create the first role
db.createUser({
    user: "jim",
    pwd: "admin123",
    roles: ["userAdminAnyDatabase"]
});

db.auth('jim', 'admin123');

show dbs;

show collections;

// Lesson 199. Built-In roles.

