const { compare } = require("bcryptjs")
const { sign } = require("jsonwebtoken")

const knex = require("../database/knex")
const AppError = require("../utils/AppError")
const authConfig = require("../configs/auth")

class SessionsControllers {
  async create(request, response) {
    const { email, password } = request.body
    const { secret, expiresIn } = authConfig.jwt

    const user = await knex("users").where({ email }).first()
    const passwordMatched = await compare(password, user.password)
    
    const token = sign({}, secret, {
      subject: String(user.id),
      expiresIn
    })

    if (!user) {
      throw new AppError("E-mail e/ou senha incorreta!", 401)
    }

    if (!passwordMatched) {
      throw new AppError("E-mail e/ou senha incorreta!", 401)
    }

    return response.json({ user, token })
  }
}

module.exports = SessionsControllers