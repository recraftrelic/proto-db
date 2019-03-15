class protoValidator {
    constructor () {
        this.rules = {}
    }

    /**
     * @param {string} rule - name of the rule
     * @param {function} validater - validater function for the rule
     * @returns {undefined}
     */
    addRule (rule, validater) {
        if (!this.rules[rule]) {
            this.rules[rule] = validater
        } else {
            throw new Error(`${rule} already exist`)
        }
    }

    match (rule, data) {
        const validatorFunction = this.rules[rule.type]
        const isValid = validatorFunction(data, rule)

        return isValid
    }
}

const validater = new protoValidator()

validater.addRule('regex',
    (data, { pattern }) => pattern.test(data)
)

module.exports = validater
