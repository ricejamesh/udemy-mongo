// Lesson 177 -- get summary statistics using buckets

// Manual bucketing.
db.persons.aggregate([
    { $bucket: {
            groupBy: '$dob.age',
            boundaries: [ 0, 18, 25, 30, 35, 40, 45, 50, 80, 120],
            output: {
                numPersons: { $sum: 1},
                averageAge: { $avg: "$dob.age"}
            }
        }
    }
])
// { "_id" : 18, "numPersons" : 375, "averageAge" : 22.664 }
// { "_id" : 25, "numPersons" : 493, "averageAge" : 26.955375253549697 }
// { "_id" : 30, "numPersons" : 447, "averageAge" : 32.006711409395976 }
// { "_id" : 35, "numPersons" : 463, "averageAge" : 36.94168466522678 }
// { "_id" : 40, "numPersons" : 479, "averageAge" : 42.06054279749478 }
// { "_id" : 45, "numPersons" : 439, "averageAge" : 47 }
// { "_id" : 50, "numPersons" : 2304, "averageAge" : 61.46440972222222 }


// Automatic bucketing using '$bucketAuto'
db.persons.aggregate([
    { $bucketAuto: {
            groupBy: '$dob.age',
            buckets: 5,
            output: {
                numPersons: { $sum: 1},
                averageAge: { $avg: "$dob.age"}
            }
        }
    }
])
// { "_id" : { "min" : 21, "max" : 32 }, "numPersons" : 1042, "averageAge" : 25.99616122840691 }
// { "_id" : { "min" : 32, "max" : 43 }, "numPersons" : 1010, "averageAge" : 36.97722772277228 }
// { "_id" : { "min" : 43, "max" : 54 }, "numPersons" : 1033, "averageAge" : 47.98838334946757 }
// { "_id" : { "min" : 54, "max" : 65 }, "numPersons" : 1064, "averageAge" : 58.99342105263158 }
// { "_id" : { "min" : 65, "max" : 74 }, "numPersons" : 851, "averageAge" : 69.11515863689776 }

// Lesson 178. Diving into addtional stages

// Find 10 males with lowest birthdays.
// Used $project to date, sort by date, and limit to first 10.
db.persons.aggregate([
    { $match: { gender: "male"}},
    { $project: { _id: 0, fullName: { $concat: ["$name.first", " ", "$name.last"]}, birthdate: { $toDate: "$dob.date"}}},
    { $sort: { birthdate: 1 }},
    { $limit: 10}
])
// { "fullName" : "عباس یاسمی", "birthdate" : ISODate("1944-09-12T07:49:20Z") }
// { "fullName" : "پرهام جعفری", "birthdate" : ISODate("1944-09-16T16:03:28Z") }
// { "fullName" : "eli henry", "birthdate" : ISODate("1944-09-17T15:04:13Z") }
// { "fullName" : "kirk brown", "birthdate" : ISODate("1944-09-18T11:03:05Z") }
// ... 6 more, for a total of 10.

// Lesson 189 writing pipeline into new collection
// Use $out stage.
db.persons.aggregate([
    { $match: { gender: "male"}},
    { $project: { _id: 0, fullName: { $concat: ["$name.first", " ", "$name.last"]}, birthdate: { $toDate: "$dob.date"}}},
    { $sort: { birthdate: 1 }},
    { $limit: 10},
    { $out: "oldMen"}
])

// Lesson 181 working with $geoNear
// From earlier... output to transformedPersons which has geojson
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
    { $out: "transformedPersons" }
  ])

// create geospatial index.
db.transformedPersons.createIndex({location: "2dsphere"})

// get at most, 10 closest people, who are greater than 30, with max distance 600,000 meters away.
db.transformedPersons.aggregate([
    { $geoNear: { 
        near: { type: "Point", coordinates: [-18.4, -42.8] },
        maxDistance: 600000,
        query: { age: { $gt: 30} },
        distanceField: "distance"}},
    { $sort: {distance: 1}},
    { $limit: 10},
    { $project: {location: 1, fullName: 1, age: 1, distance: 1}}
])
