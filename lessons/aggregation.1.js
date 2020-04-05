// mongoimport /d personsData /c persons /jsonArray  persons.json

// use personsData

// Seperate into two projection stages.
// Keep name and email, and dynamically create a geojson location point field.
// Move age to top level field.
// Move dob to top-level field, converting to mongo date type.
// Convert first and last names into a single field, with proper first letter punctuation.
// Sort by fullName.

// Simple transformation for the date field:  $toDate

db.persons.aggregate([
    { $project: {
        _id: 0,
        name: 1,
        email: 1,
        birthDate: { $convert: { input:"$dob.date", to: "date"}},
        age: "$dob.age",
        location: {
            type: "Point",
            coordinates: [
                { $convert: {input: "$location.coordinates.longitude", to: "double", onError: 0.0, onNull: 0.0}},
                { $convert: {input: "$location.coordinates.latitude", to: "double", onError: 0.0, onNull: 0.0}}
            ]
        }}},
    {$project: {email: 1, location: 1, birthDate: 1, age: 1,
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

// { "location" : { "type" : "Point", "coordinates" : [ -109.3633, 69.0694 ] }, "email" : "aada.hakola@example.com", "birthDate" : ISODate("1953-05-21T05:39:16Z"), "age" : 65, "fullName" : "Aada Hakola" }
// { "location" : { "type" : "Point", "coordinates" : [ 145.312, -25.0558 ] }, "email" : "aada.lepisto@example.com", "birthDate" : ISODate("1973-07-28T05:33:07Z"), "age" : 45, "fullName" : "Aada Lepisto" }
// { "location" : { "type" : "Point", "coordinates" : [ -178.2939, 4.8272 ] }, "email" : "aada.seppala@example.com", "birthDate" : ISODate("1977-04-20T11:38:59Z"), "age" : 41, "fullName" : "Aada Seppala" }
// { "location" : { "type" : "Point", "coordinates" : [ -59.8319, -26.8106 ] }, "email" : "aada.waisanen@example.com", "birthDate" : ISODate("1991-03-30T11:51:19Z"), "age" : 27, "fullName" : "Aada Waisanen" }
// { "location" : { "type" : "Point", "coordinates" : [ -168.6493, -68.8133 ] }, "email" : "aada.walli@example.com", "birthDate" : ISODate("1947-03-14T07:09:53Z"), "age" : 71, "fullName" : "Aada Walli" }
// ...


// Add a grouping by birthYear and the count in each year
db.persons.aggregate([
    { $project: {
        _id: 0,
        name: 1,
        email: 1,
        birthDate: { $convert: { input:"$dob.date", to: "date"}},
        age: "$dob.age",
        location: {
            type: "Point",
            coordinates: [
                { $convert: {input: "$location.coordinates.longitude", to: "double", onError: 0.0, onNull: 0.0}},
                { $convert: {input: "$location.coordinates.latitude", to: "double", onError: 0.0, onNull: 0.0}}
            ]
        }}},
    {$project: {email: 1, location: 1, birthDate: 1, age: 1,
        fullName: { 
            $concat: [
                { $toUpper: { $substrCP: ["$name.first", 0, 1] }},
                { $substrCP: ["$name.first", 1, {$subtract: [{$strLenCP: "$name.first"}, 1]}]},
                " ",
                { $toUpper: { $substrCP: ["$name.last", 0, 1] }},
                { $substrCP: ["$name.last", 1, {$subtract: [{$strLenCP: "$name.last"}, 1]}]}
            ]}}},
    {$sort: {fullName: 1 }},
    {$group: {_id: {birthYear: { $isoWeekYear: "$birthDate" }}, numPersons: { $sum: 1 }}},
    {$sort: {numPersons: -1}}
])

// { "_id" : { "birthYear" : NumberLong(1955) }, "numPersons" : 113 }
// { "_id" : { "birthYear" : NumberLong(1961) }, "numPersons" : 111 }
// { "_id" : { "birthYear" : NumberLong(1993) }, "numPersons" : 110 }
// { "_id" : { "birthYear" : NumberLong(1960) }, "numPersons" : 110 }
// { "_id" : { "birthYear" : NumberLong(1975) }, "numPersons" : 107 }
// ...