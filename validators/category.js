const {check} = require('express-validator')

exports.categoryCreateValidators = [
    check('name')
    .not()
    .isEmpty()
    .withMessage('Name is required')
     
]
