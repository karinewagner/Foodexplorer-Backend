const { Router } = require("express")

const UsersController = require("../controllers/UsersController")

const usersRoutes = Router()
const usersController = new UsersController()

/*function myMiddleware(request, response, next) {
  if (!request.body.isAdmin) {
    return response.json({ message: "User unauthorized"})
  }

  next()
}
usersRoutes.post("/", myMiddleware, usersController.create)*/

usersRoutes.post("/", usersController.create)
usersRoutes.put("/:id", usersController.update)

module.exports = usersRoutes