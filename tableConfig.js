var storageConfig = {
    tableName: process.env.tableName, // You define
    storageName: process.env.storageName, // Obtain from Azure Portal
    storageKey: process.env.storageKey // Obtain from Azure Portal
}

module.exports = storageConfig;