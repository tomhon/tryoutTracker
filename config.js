var sqlConfig = {
    userName: '',
    password: '',
    server: 'tryouttrackersqlserver.database.windows.net',
    enforceTable: true, // If this property is not set to true it defaults to false. When false if the specified table is not found, the bot will throw an error.
    options: {
        database: 'tryoutTrackerSQLDB',
        table: 'testing',
        encrypt: true,
        rowCollectionOnRequestCompletion: true
    }
};


module.exports = sqlConfig;
