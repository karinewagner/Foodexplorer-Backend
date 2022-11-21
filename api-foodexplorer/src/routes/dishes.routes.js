const { Router } = require("express")

const DishesController = require("../controllers/DishesController")

const dishesRoutes = Router()
const dishesController = new DishesController()

/*function myMiddleware(request, response, next) {
  if (!request.body.isAdmin) {
    return response.json({ message: "User unauthorized"})
  }

  next()
}
usersRoutes.post("/", myMiddleware, usersController.create)*/

dishesRoutes.post("/:user_id", dishesController.create)
dishesRoutes.get("/", dishesController.index)
dishesRoutes.get("/:id", dishesController.show)
dishesRoutes.delete("/:id", dishesController.delete)

module.exports = dishesRoutes