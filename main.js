const fs = require('fs')
const path = require('path')
const readline = require('readline')

const defaultDbPath = './db'

const fsUtils = require('./utils/fs')
const objectUtils = require('./utils/object')

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
            flags: 'a',
        })

        writeStream.write(
            JSON.stringify(record) + '\n'
        )

        writeStream.end()

    }

    delete (query = {}, options = {}) {

        return new Promise (
            
            ( resolve, reject ) => {

                if (objectUtils.isEmpty(query)) {
    
                    reject('Delete object is empty')

                    return
    
                }

                const storePath = path.join( this.db, this.store )

                let pathForTable = path.resolve( path.join(storePath, `${this.name}.rdb`) ).toString()

                const instream = fs.createReadStream(pathForTable)
                const outstream = new (require('stream'))()
                const rd = readline.createInterface(instream, outstream)

                let deleteList = []

                rd.on('line', line => {

                    const record = JSON.parse(line)

                    let isMatch = true

                    for ( let key in query ) {

                        if (record[key]) {

                            if ( record[key] !== query[key] ) {
                                isMatch = false
                            }

                        } else {
                            isMatch = false
                        }

                    }

                    if (isMatch) {

                        deleteList.push({
                            from: line,
                            to: ''
                        })

                    }

                });

                rd.on('close', function (line) {
                    fsUtils.updateFile(pathForTable, deleteList).then(resolve)
                });
    
            }

        )

    }

    update (query = {}, updatedRecord = {}, options = {}) {

        return new Promise (
            
            ( resolve, reject ) => {

                if (objectUtils.isEmpty(query)) {
    
                    reject('Update object is empty')

                    return
    
                }

                const storePath = path.join( this.db, this.store )

                let pathForTable = path.resolve( path.join(storePath, `${this.name}.rdb`) ).toString()

                const instream = fs.createReadStream(pathForTable)
                const outstream = new (require('stream'))()
                const rd = readline.createInterface(instream, outstream)

                let updateList = []

                rd.on('line', line => {

                    const record = JSON.parse(line)

                    let isMatch = true

                    for ( let key in query ) {

                        if (record[key]) {

                            if ( record[key] !== query[key] ) {
                                isMatch = false
                            }

                        } else {
                            isMatch = false
                        }

                    }

                    if (isMatch) {

                        updateList.push({
                            from: line,
                            to: JSON.stringify({
                                ...record,
                                ...updatedRecord
                            })
                        })

                    }

                });

                rd.on('close', function (line) {
                    fsUtils.updateFile(pathForTable, updateList).then(resolve)
                });
    
            }

        )

    }

    find (query = {}, options = {}) {

        return new Promise (
            
            ( resolve, reject ) => {

                if (objectUtils.isEmpty(query)) {
    
                    this.get().then(resolve)

                    return
    
                }

                const storePath = path.join( this.db, this.store )

                let pathForTable = path.resolve( path.join(storePath, `${this.name}.rdb`) ).toString()

                const instream = fs.createReadStream(pathForTable)
                const outstream = new (require('stream'))()
                const rd = readline.createInterface(instream, outstream)

                let records = []

                rd.on('line', line => {

                    const record = JSON.parse(line)

                    let isMatch = true

                    for ( let key in query ) {

                        if (record[key]) {

                            if ( record[key] !== query[key] ) {
                                isMatch = false
                            }

                        } else {
                            isMatch = false
                        }

                    }

                    if (isMatch) {
                        records.push(record)
                    }
                    
                });

                rd.on('close', function (line) {
                    
                    resolve(records)

                });
    
            }

        )

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

class ProtoDB {

    constructor (dbPath) {

        // db path
        this.dbPath = dbPath || defaultDbPath
        // current Store which ProtoDB is dealing with
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

            const stats = await fsUtils.stat(path.join(storePath, `${tableName}.rdb`))

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

module.exports = ProtoDB