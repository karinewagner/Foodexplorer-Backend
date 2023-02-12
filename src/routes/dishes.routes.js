const { Router } = require("express")
const multer = require("multer")
const uploadConfig = require("../configs/upload")

const upload = multer(uploadConfig.MULTER)

const dishesRoutes = Router()

const ensureAuthenticated = require("../middlewares/ensureAuthenticated")
const adminAuthenticated = require("../middlewares/adminAuthenticated")
const DishesController = require("../controllers/DishesController")

const dishesController = new DishesController()

dishesRoutes.use(ensureAuthenticated)

dishesRoutes.post("/", adminAuthenticated, upload.single("img"), dishesController.create)
dishesRoutes.get("/", dishesController.index)
dishesRoutes.get("/:id", dishesController.show)
dishesRoutes.delete("/:id", adminAuthenticated, upload.single("img"), dishesController.delete)
dishesRoutes.put("/:id", adminAuthenticated, upload.single("img"), dishesController.update)

module.exports = dishesRoutes