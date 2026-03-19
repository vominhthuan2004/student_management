const { body } = require("express-validator");

exports.registerValidation = [
    body("username")
        .notEmpty()
        .withMessage("Username is required"),

    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters")
];

exports.loginValidation = [
    body("username")
        .notEmpty()
        .withMessage("Username is required"),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
];