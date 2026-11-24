const sql = require('mssql');
const dbConfig = require('../config/dbConfig');

const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log('✅ Đã kết nối thành công tới Cơ sở dữ liệu SQL Server: ' + dbConfig.database);
        return pool;
    })
    .catch(err => {
        console.error('❌ Lỗi kết nối CSDL SQL Server: ', err.message);
        console.warn('⚠️ Gợi ý: Hãy kiểm tra thông tin trong file .env (User, Password, Server, Port) và đảm bảo SQL Server Browser / Service đang chạy.');
        return null;
    });

module.exports = {
    sql,
    poolPromise
};
