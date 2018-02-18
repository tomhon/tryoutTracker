var sqlConfig = {
    userName: process.env.user,
    password: process.env.password,
    server: process.env.server,
    enforceTable: true, // If this property is not set to true it defaults to false. When false if the specified table is not found, the bot will throw an error.
    options: {
        database: process.env.database,
        table: process.env.clubTable,
        encrypt: true,
        rowCollectionOnRequestCompletion: true
    }
};

module.exports = sqlConfig;


