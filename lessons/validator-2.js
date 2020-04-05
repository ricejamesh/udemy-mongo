db.runCommand({collMod: 'posts',
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['title', 'text', 'creator', 'comments'],
            properties: {
                title: {
                    bsonType: 'string',
                    description: 'Must be a string and is required'
                },
                text: {
                    bsonType: 'string',
                    description: 'Must be a string and is required'
                },
                creator: {
                    bsonType: 'objectId',
                    description: 'Must be a objectId and is required'
                },
                comments: {
                    bsonType: 'array',
                    description: 'Must be an array and is required',
                    items: {
                        bsonType: 'object',
                        required: ['text', 'author'],
                        properties: {
                            text: {
                                bsonType: 'string',
                                description: 'Must be a string and is required'
                            },
                            author: {
                                bsonType: 'objectId',
                                description: 'Must be an objectId and is required'
                            }
                        }
                    }
                },
            }
        }
    },
    validationAction: "warn"
});