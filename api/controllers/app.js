'use strict'
const f = require('fs')
const path = require('path')
const cpfCnpj = require('../utils/cpfCnpj')
const pgsql = require('../lib/pgsql')

const app = {
    /**
     * Função responsável por ler e extrair as informações do arquivo
     * @param {*} file 
     * @returns 
     */
    async arquivo(file) {
        try {
            const retArr = []
            const falhaArr = []
            //Pega arquivo
            const fileDir = path.join(`${__dirname}../../uploads`, `${file}`)
            file = f.readFileSync(fileDir).toString()
            //remove o cabeçalho do arquivo
            const arrFile = file.split('\n').splice(1)
            console.log('Processando...')

            // converte o arquivo em objeto Json,
            // trata os devidos tipos e valida CPF e CNPJ, caso não tenha essa informação, não insere no banco.
            for (const linha of arrFile) {
                const obj = {}
                obj.cpf = linha.substring(0, 19).replace(/[^0-9]+/g, '');
                obj.private = Number(linha.substring(20, 31))
                obj.incompleto = Number(linha.substring(31, 43))
                obj.dtUltimaCompra = linha.substring(43, 65).trim()
                obj.ticketMedio = linha.substring(65, 87).replace(/[^0-9]+/g, '') / 100;
                obj.ticketUltimaCompra = linha.substring(87, 111).replace(/[^0-9]+/g, '') / 100;
                obj.lojaMaisfrequente = linha.substring(111, 131).replace(/[^0-9]+/g, '')
                obj.lojaUltimaCompra = linha.substring(131, 150).replace(/[^0-9]+/g, '')
                //Válida CPF e CNPJ do objeto
                if (await this.validaDados(obj)) {
                    retArr.push(obj)
                } else {
                    falhaArr.push(obj)
                }
            }
            // Prepara o insert com 500 registros
            let total = retArr.length
            let limit = 500;
            let valuesArr = []
            for (const obj of retArr) {
                if (total < limit) {
                    limit = total
                }
                //Monta o value para o insert
                valuesArr.push(await this.montaStringInsert(obj))
                //Insere e limpa o value para uma nova remessa de registros
                if (valuesArr.length == limit) {
                    await this.insereClienteLoja(valuesArr.join())
                    valuesArr = []
                    total -= limit
                }
            }
            //Finaliza processo retorna registros que não foram insereidos
            console.log('Finalizou!')
            return {
                naoinseridos: falhaArr
            }
        } catch (error) {
            console.log('error', error)
            throw error
        }
    },
    /**
     * Válida CPF e CNPJ do objeto
     * caso o CPF/CNPJ não sejam válidos calculando o digito verificador,
     * não será incluido na lista  para ser inserido no banco.
     * @param {*} data 
     * @returns 
     */
    async validaDados(data) {
        try {
            let flag = true
            if (!await cpfCnpj.valida(data.cpf)) {
                flag = false
            }
            if (!await cpfCnpj.valida(data.lojaMaisfrequente) || !await cpfCnpj.valida(data.lojaUltimaCompra)) {
                flag = false
            }
            return flag
        } catch (error) {
            console.log('error', error)
            throw error
        }
    },
    /**
     * Monta string de Value para o insert
     * @param {*} data 
     * @returns 
     */
    async montaStringInsert(data) {
        return `(E'${data.cpf}', ${data.private}, ${data.incompleto}, E'${data.dtUltimaCompra}',${data.ticketMedio}, ${data.ticketUltimaCompra}, E'${data.lojaMaisfrequente}', E'${data.lojaUltimaCompra}')`
    },
    /**
     * Executa a query de insert 
     * @param {*} str 
     * @returns 
     */
    async insereClienteLoja(str) {
        try {
            const sql = `INSERT INTO public.nw_cliente_loja ("cpf", "private", "incompleto", "dt_ultima_compra", "ticket_medio", "ticket_ultima_compra", "loja_mais_frequente", "loja_ultima_compra")
            VALUES 
            ${str}`
            const ret = await pgsql.query(sql)
            return true
        } catch (error) {
            throw error;
        }

    }

}

module.exports = app;