const {check} = require('express-validator')

exports.tagCreateValidators = [
    check('name')
    .not()
    .isEmpty()
    .withMessage('Name is required')
     
]
