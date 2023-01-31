const { hash } = require("bcryptjs")

exports.seed = async function (knex) {
    await knex("users").delete()
    await knex("users").insert([
        {
            name: 'Admin',
            email: 'admin@teste.com',
            password: await hash('teste123', 8),
            is_admin: true,
        }
    ])
}