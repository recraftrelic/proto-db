const fs = require('fs')

const mkdir = (dir, options = {}) =>
    new Promise (
        (resolve, reject) => 
            fs.mkdir(dir, options, err => err ? reject(err) : resolve(dir))
    )

const stat = dir => 
    new Promise (
        (resolve, reject) => 
            fs.stat(dir, (err, stats) => err ? reject(err) : resolve(stats))
    )

module.exports = {
    mkdir,
    stat
}