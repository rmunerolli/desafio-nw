'use strict'
/**
 * Lib PostgreSql para conexão
 */
const Pool = require('pg').Pool;
const config = require('config')
/**
 * Inicia e cria tabela caso não exista
 */
start()
async function start() {
    const pool = new Pool(config.get('pgsql'))
    try {
        pool.connect()
        console.log('Conectado ao Postgres')
        const createTable = `CREATE TABLE IF NOT EXISTS public.nw_cliente_loja (
        id_cliente_loja SERIAL,
        cpf VARCHAR(20) NOT NULL,
        private INTEGER NOT NULL,
        incompleto INTEGER NOT NULL,
        dt_ultima_compra DATE NOT NULL,
        ticket_medio MONEY NOT NULL,
        ticket_ultima_compra MONEY NOT NULL,
        loja_mais_frequente VARCHAR(20) NOT NULL,
        loja_ultima_compra VARCHAR(20) NOT NULL,
        CONSTRAINT nw_cliente_loja_pkey PRIMARY KEY(id_cliente_loja)
      ) 
      WITH (oids = false);
      
      ALTER TABLE public.nw_cliente_loja
        OWNER TO postgres;`
        await pool.query(createTable)
    } catch (error) {
        console.log('Falha ao conctar ao Postgres')
    } finally {
        await pool.end()
    }
}
/**
 * Função de execução de query.
 */
const pgsql = {
    async query(sql) {
        const pool = new Pool(config.get('pgsql'))
        try {
            //Bloqueia querys indesejadas
            if (sql.toLowerCase().indexOf('drop') > -1 || sql.toLowerCase().indexOf('delete') > -1
                || sql.toLowerCase().indexOf('restore database') > -1
                || (sql.toLowerCase().indexOf('update' > -1) && sql.toLowerCase().indexOf('set') > -1)) {
                console.log('[SQL] Query bloqueada:', sql);
                throw { message: '[SQL] Não foi possivel realizar a operação.' }
            }
            await pool.query(sql)
            return true
        } catch (error) {
            console.log('error', error)
            throw { message: 'Falha ao executar a query. Erro:', error }
        } finally {
            await pool.end()
        }
    }
}

module.exports = pgsql

