// mongoimport /d personsData /c persons /jsonArray  persons.json

// use personsData

db.persons.aggregate([
    { $match: { gender: 'female' } },
    { $group: { _id: { state: "$location.state" }, totalPersons: { $sum: 1 } } }
]).pretty();

// Add sort.
db.persons.aggregate([
    { $match: { gender: 'female' } },
    { $group: { _id: { state: "$location.state" }, totalPersons: { $sum: 1 } } },
    { $sort: { totalPersons : -1 } }
]);

// Assignment 7
// For persons with age > 50, group by gender, show total count and avg age.
db.persons.findOne();
db.persons.aggregate([
    { $match: { "dob.age" : { $gte : 50 } } },
    { $group: { _id: { gender: "$gender" }, totalPersons: { $sum: 1 }, avgAge: { $avg: "$dob.age"} } }
]);

db.persons.aggregate([
    {$project: {_id: 0, gender: 1, fullName: { $concat: ["$name.first", " ", "$name.last"]}}},
    {$sort: {fullName: 1 }}
])


db.persons.aggregate([
    {$project: {_id: 0, gender: 1, 
        fullName: { 
            $concat: [
                { $toUpper: { $substrCP: ["$name.first", 0, 1] }},
                { $substrCP: ["$name.first", 1, {$subtract: [{$strLenCP: "$name.first"}, 1]}]},
                " ",
                { $toUpper: { $substrCP: ["$name.last", 0, 1] }},
                { $substrCP: ["$name.last", 1, {$subtract: [{$strLenCP: "$name.last"}, 1]}]}
            ]}}},
    {$sort: {fullName: 1 }}
])