// index.js
const conf = {};
conf.environment = 'development';
conf.sequelize = {};
conf.sequelize.username = 'root'; //kitchen_root123
conf.sequelize.password = ''; //4-$4JWs-fnCX9RV
conf.sequelize.database = 'pal-kitchen'; //pal_kitchen
conf.sequelize.host = 'localhost'; // db4free.net
conf.sequelize.dialect = 'mysql';
conf.sequelize.port = 3306;
conf.sequelize.define = {
charset: 'utf8mb4',
dialectOptions: {
collate: 'utf8mb4_unicode_ci'
}
}
conf.ROUND_SALT = 8;
module.exports = conf;