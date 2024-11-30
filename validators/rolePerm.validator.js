const Joi = require('joi');

const createRoleSchema = (validPermissions) => {
    return Joi.object({
        name: Joi.string()
            .trim()
            .min(3)
            .max(50)
            .required()
            .messages({
                "string.empty": "Role name is required.",
                "string.min": "Role name must be at least 3 characters.",
                "string.max": "Role name cannot exceed 50 characters.",
                "any.required": "Role name is required.",
            }),
        permissions: Joi.array()
            .items(
                Joi.string()
                    .valid(...validPermissions)
                    .required()
                    .messages({
                        "any.only": "Invalid permission provided.",
                        "any.required": "Each permission is required.",
                    })
            )
            .min(1)
            .required()
            .messages({
                "array.base": "Permissions must be an array.",
                "array.min": "At least one permission must be specified.",
                "any.required": "Permissions are required.",
            }),
    });
};

module.exports = {
    validateCreateRole: (data, validPermissions) => {
        const schema = createRoleSchema(validPermissions);
        return schema.validate(data, { abortEarly: false });
    },
};
