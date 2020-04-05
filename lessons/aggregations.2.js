// insert data using array-data.js

db.friends.aggregate([
    { $group: { 
        _id: { age: "$age"}, 
        allHobbies: {$push: "$hobbies"}}}
])
// { "_id" : { "age" : 29 }, "allHobbies" : [ [ "Sports", "Cooking" ], [ "Cooking", "Skiing" ] ] }
// { "_id" : { "age" : 30 }, "allHobbies" : [ [ "Eating", "Data Analytics" ] ] }

// Unwind an array to duplicate documents, one for each array entry.
db.friends.aggregate([
    { $unwind: "$hobbies"}
])
// Expands hobbies array into hobbies field.
// { "_id" : ObjectId("5e7d320afaaf90841ab4ef02"), "name" : "Max", "hobbies" : "Sports", "age" : 29, "examScores" : [ { ...} ] }
// { "_id" : ObjectId("5e7d320afaaf90841ab4ef02"), "name" : "Max", "hobbies" : "Cooking", "age" : 29, "examScores" : [ { ...} ] }
// { "_id" : ObjectId("5e7d320afaaf90841ab4ef03"), "name" : "Manu", "hobbies" : "Eating", "age" : 30, "examScores" : [ { ...} ] }
// { "_id" : ObjectId("5e7d320afaaf90841ab4ef03"), "name" : "Manu", "hobbies" : "Data Analytics", "age" : 30, "examScores" : [ { ...} ] }
// ...

// Unwind array and then group by the expanded field.
db.friends.aggregate([
    { $unwind: "$hobbies"},
    { $group: { 
        _id: { age: "$age"}, 
        allHobbies: {$push: "$hobbies"}}}
])
// { "_id" : { "age" : 30 }, "allHobbies" : [ "Eating", "Data Analytics" ] }
// { "_id" : { "age" : 29 }, "allHobbies" : [ "Sports", "Cooking", "Cooking", "Skiing" ] }  <-- Duplicates

// Remove duplicates with $addToSet
db.friends.aggregate([
    { $unwind: "$hobbies"},
    { $group: { 
        _id: { age: "$age"}, 
        allHobbies: {$addToSet: "$hobbies"}}}
])
// { "_id" : { "age" : 30 }, "allHobbies" : [ "Data Analytics", "Eating" ] }
// { "_id" : { "age" : 29 }, "allHobbies" : [ "Skiing", "Cooking", "Sports" ] }  <-- No duplicates

// Slice something out of an array
db.friends.aggregate([
    { $project: {_id: 0, examScore: { $slice: ["$examScores", 1]}}}
])
// { "examScore" : [ { "difficulty" : 4, "score" : 57.9 } ] }
// { "examScore" : [ { "difficulty" : 7, "score" : 52.1 } ] }
// { "examScore" : [ { "difficulty" : 3, "score" : 75.1 } ] }

// get the size of an array
db.friends.aggregate([
    { $project: {_id: 0, numScores: { $size: "$examScores"}}}
])

// filter array elements, using examScores
// sc is a temporary value, referenced using double $$.
db.friends.aggregate([
    { $project: {_id: 0, scores: { $filter: {input: "$examScores", as: "sc", cond: { $gt: ["$$sc.score", 60]}}}}}
])

// Find the highest test score per person
db.friends.aggregate([
    { $unwind: "$examScores"},
    { $project: {
        _id: 1,
        name: 1,
        score: "$examScores.score"
    }},
    { $group: {
        _id: "$_id",
        name: {$first: "$name"},
        maxScore: {$max: "$score"}
    }},
    { $sort: {"maxScore": 1}}
])