var sqlConfig = {
    userName: process.env.user || 'ScoreGoals',
    password: process.env.password || 'Russia2018',
    server: process.env.server || 'tryouttrackersqlserver.database.windows.net',
    enforceTable: true, // If this property is not set to true it defaults to false. When false if the specified table is not found, the bot will throw an error.
    options: {
        database: process.env.database || 'tryoutTrackerSQLDB',
        table: process.env.clubTable || 'testing',
        encrypt: true,
        rowCollectionOnRequestCompletion: true
    }
};

module.exports = sqlConfig;


