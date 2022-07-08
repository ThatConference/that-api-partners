// ensures google tracing is first thing loaded.
require('dotenv').config();

const enableTrace = JSON.parse(process.env.ENABLE_GOOGLE_TRACE || false);

if (enableTrace) {
  // eslint-disable-next-line global-require
  require('@google-cloud/trace-agent').start({
    logLevel: 2,
    enhancedDatabaseReporting: true,
    flushDelaySeconds: 15,
    serviceContext: {
      service: 'that-api-partners',
    },
  });
}
require('./indexMain');
