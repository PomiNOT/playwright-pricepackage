import sql from 'mssql';

const sqlConfig = {
    user: 'sa',
    password: '123',
    database: 'Quiz_Practice',
    server: 'localhost',
    pool: {
        max: 1,
        min: 1,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: false,
        trustServerCertificate: false
    }
}


function getPoolFactory() {
    /**
     * Store connection pool here so that it can be 
     * returned immediately when getConnection is called
     * twice
     * 
     * Typical Singleton pattern
     * @type {sql.ConnectionPool}
     */
    let pool;

    return async function() {
        if (!pool) {
            pool = await sql.connect(sqlConfig);
            
            //override close method to automatically set pool to null when closing
            const close = pool.close.bind(pool); // rebind 'this' to the pool otherwise we get incorrect 'this' reference.

            pool.close = async function(...args) {
                await close(args);
                pool = null;
            }
        }

        return pool;
    }
}

const getPool = getPoolFactory();

// prepare test data for test cases
export async function setupPricePackages() {
    const pool = await getPool();
    const transaction = await pool.transaction();
   
    await transaction.begin()
    try {
        await transaction.request().query(`
        UPDATE [Package] 
        SET PackageName = '6 Month Premium', 
            PackageDuration = 6, 
            ListPrice = 20, 
            SalePrice = 16, 
            Status = 0
        WHERE PackageId = 1;

        UPDATE [Package] 
        SET PackageName = '9 Month Premium', 
            PackageDuration = 9, 
            ListPrice = 30, 
            SalePrice = 24, 
            Status = 1
        WHERE PackageId = 2;

        UPDATE [Package] 
        SET PackageName = '3 Month Premium', 
            PackageDuration = 3, 
            ListPrice = 10, 
            SalePrice = 9, 
            Status = 1
        WHERE PackageId = 3;

        DELETE FROM [Package]
        WHERE PackageId > 3 and SubjectId = 1;
        `)
   
        await transaction.commit();
    } catch (err) {
        await transaction.rollback();
        throw err;
    } finally {
        await pool.close();
    }
}