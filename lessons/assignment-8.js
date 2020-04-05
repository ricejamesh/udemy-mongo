use admin;
db.createUser({ user: 'userAdmin', pwd: 'userAdmin', roles: ["userAdminAnyDatabase"]});
db.logout();
db.auth('userAdmin', 'userAdmin');
show dbs;
show collections;
db.getUser('userAdmin');

db.createUser({ user: 'dbAdmin', pwd: 'dbAdmin', roles: ["dbAdminAnyDatabase"]});

use customers;
db.createUser({ user: 'dev1', pwd: 'dev', roles: ["readWrite", {role: 'readWrite', db: 'sales'}]});

use admin;
db.logout();

use customers;
db.auth('dev1', 'dev');
db.people.insertOne({name: 'jim'});
db.people.find();

db.logout();

use admin;
db.auth('dbAdmin', 'dbAdmin');

use customers;
db.people.createIndex({name: 1});