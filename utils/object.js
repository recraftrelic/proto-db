const isEmpty = map => {
    for(var key in map) {
        if (map.hasOwnProperty(key)) {
            return false
        }
    }
    return true
}

module.exports = {
    isEmpty
}