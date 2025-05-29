const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'railway-csbs',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

