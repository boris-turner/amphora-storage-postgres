'use strict';

// Postgres
module.exports.POSTGRES_USER     = process.env.CLAY_STORAGE_POSTGRES_USER     || 'postgres';
module.exports.POSTGRES_PASSWORD = process.env.CLAY_STORAGE_POSTGRES_PASSWORD || 'example';
module.exports.POSTGRES_HOST     = process.env.CLAY_STORAGE_POSTGRES_HOST;
module.exports.POSTGRES_PORT     = process.env.CLAY_STORAGE_POSTGRES_PORT     || 5432;
module.exports.POSTGRES_DB       = process.env.CLAY_STORAGE_POSTGRES_DB       || 'clay';
module.exports.CONNECTION_POOL_MIN = parseInt(process.env.CLAY_STORAGE_CONNECTION_POOL_MIN, 10) || 2;
module.exports.CONNECTION_POOL_MAX = parseInt(process.env.CLAY_STORAGE_CONNECTION_POOL_MAX, 10) || 10;

// Redis
module.exports.CACHE_ENABLED     = process.env.CLAY_STORAGE_POSTGRES_CACHE_ENABLED     || false;
module.exports.REDIS_HASH        = process.env.CLAY_STORAGE_POSTGRES_CACHE_HASH        || 'clay';
module.exports.REDIS_URL         = process.env.CLAY_STORAGE_POSTGRES_CACHE_HOST;

// Application code
module.exports.DATA_STRUCTURES   = ['components', 'layouts', 'pages', 'uris', 'lists', 'users'];
module.exports.ENABLE_TIMESTAMP_FIELDS = process.env.CLAY_STORAGE_ENABLE_TIMESTAMP_FIELDS     || true;
module.exports.TIMESTAMP_FIELDS  = ['created_at', 'updated_at', 'last_published_at', 'first_published_at'];

let TABLE                        = 'id TEXT PRIMARY KEY NOT NULL, data JSONB',
  ADDITIONAL                     = module.exports.ENABLE_TIMESTAMP_FIELDS ? ', created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), last_published_at TIMESTAMPTZ, first_published_at TIMESTAMPTZ' : '';

module.exports.TABLE_WITHOUT_META =  TABLE + ADDITIONAL;
module.exports.TABLE_WITH_META    =  TABLE + ', meta JSONB' + ADDITIONAL;
