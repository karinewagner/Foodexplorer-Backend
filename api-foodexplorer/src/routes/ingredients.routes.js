const { Router } = require("express")

const IngredientsController = require("../controllers/IngredientsController")

const ingredientsRoutes = Router()
const ingredientsController = new IngredientsController()

/*function myMiddleware(request, response, next) {
  if (!request.body.isAdmin) {
    return response.json({ message: "User unauthorized"})
  }

  next()
}
usersRoutes.post("/", myMiddleware, usersController.create)*/

ingredientsRoutes.get("/:user_id", ingredientsController.index)

module.exports = ingredientsRoutes