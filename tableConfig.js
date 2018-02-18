var storageConfig = {
    tableName: process.env.tableName || 'tryoutTrackerTableStore' , // You define
    storageName: process.env.storageName || 'tryouttrackertablestore', // Obtain from Azure Portal
    storageKey: process.env.storageKey || '0P1qPZB0LJQa+V1VTyPu1llnw4KcWFJMK3XLWEMRyU1jJ0q7ioNw8ZNQwvxNISyvMjcgGbj0EFqXRC5EEpp8Bg==' // Obtain from Azure Portal
}

module.exports = storageConfig;