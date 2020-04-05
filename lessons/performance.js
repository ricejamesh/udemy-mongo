use performance;
db.createCollection("capped", {capped: true, size: 10000, max: 3});
db.capped.insertMany([{name: "Steve"}, {name: "Chris"}, {name: 'Jim'}]);
db.capped.find();
db.capped.insertOne({name: 'Chuck'});

db.capped.find();
// Steve will no longer be in the collection.