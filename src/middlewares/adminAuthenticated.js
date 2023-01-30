const knex = require("../database/knex")
const AppError = require("../utils/AppError")

async function adminAuthenticated(request, response, next) {

  const { id } = request.user
  const user = await knex("users").where({ id })
  const isAdmin = user[0].is_Admin

  if (!isAdmin) {
    throw new AppError("User unauthorized", 401)
  }

  return next()
} 

module.exports = adminAuthenticated