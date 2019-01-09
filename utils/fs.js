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

const updateFile = (path, updateList) =>
    new Promise (
        (resolve, reject) =>
            fs.readFile(path, 'utf-8', (err, data) => {

                if (err) reject(err)
                else {

                    var newValue = data;

                    updateList.forEach(
                        update => {
                            newValue = newValue.replace(update.from, update.to)
                        }
                    )

                    newValue = newValue.split('\n').filter(value => value).join('\n')
            
                    fs.writeFile(path, newValue, 'utf-8', (err) => {
                        if (err) reject(err)
                        else resolve(true)
                    })
                }
            })
    )

module.exports = {
    mkdir,
    stat,
    updateFile
}