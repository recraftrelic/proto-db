const fs = require('fs')
const path = require('path')
const readline = require('readline')

const defaultDbPath = './db'

const fsUtils = require('./utils/fs')

class Table {

    constructor (name, store, db) {

        this.name = name
        this.store = store
        this.db = db

    }

    create ( record ) {

        const storePath = path.join( this.db, this.store )

        let pathForTable = path.resolve( path.join(storePath, `${this.name}.rdb`) ).toString()

        const writeStream = fs.createWriteStream(pathForTable, {
            flags: 'a'
        })

        writeStream.write(
            JSON.stringify(record) + '\n'
        )

        writeStream.end()

    }

    get () {

        return new Promise (
            (resolve, reject) => {

                const storePath = path.join( this.db, this.store )

                let pathForTable = path.resolve( path.join(storePath, `${this.name}.rdb`) ).toString()

                const instream = fs.createReadStream(pathForTable)
                const outstream = new (require('stream'))()
                const rd = readline.createInterface(instream, outstream)

                let records = []
                
                
                rd.on('line', line => {
                    records.push(JSON.parse(line))
                });

                rd.on('close', function (line) {
                    
                    resolve(records)

                });

            }
        )

    }

}

class RapidDB {

    constructor () {

        // db path
        this.dbPath = defaultDbPath
        // current Store which RapidDB is dealing with
        this.currentStore = null

    }

    setStore ( currentStore ) {

        this.currentStore = currentStore

    }

    table ( tableName ) {
        return new Table(tableName, this.currentStore, this.dbPath)
    }

    async createTable ( tableName ) {

        const dbPath = this.dbPath || defaultDbPath

        const storePath = path.join( dbPath, this.currentStore )

        try {

            const stats = await fsUtils.stat(storePath)

            if (stats) {

                console.log('Table already exists')

            }

        } catch ( err ) {

            switch(err.code) {

                case 'ENOENT':
                    
                    try {

                        let pathForTable = path.resolve( path.join(storePath, `${tableName}.rdb`) ).toString()

                        const createWriteStream = fs.createWriteStream(pathForTable)

                        createWriteStream.end()

                        console.log('Table created')

                    } catch (err) {

                        console.log(err)

                    }

            }

        }

    }

    async createStore ( name ) {

        const dbPath = this.dbPath || defaultDbPath

        const storePath = path.join( dbPath, name )

        try {

            const stats = await fsUtils.stat(storePath)

            if (stats) {

                console.log('Store already exists')

            }

        } catch ( err ) {

            switch(err.code) {

                case 'ENOENT':
                    
                    try {

                        const created = await fsUtils.mkdir(storePath, {})

                        if (created) {
                            
                            console.log('Store created')

                        }

                    } catch (err) {

                        console.log(err)

                    }

            }

        }


    } 

}

const db = new RapidDB()

db.createStore('todo')
db.setStore('todo')

db.table('users').get().then( records => console.log(records) )