const knex = require("../database/knex")
const AppError = require("../utils/AppError")
const DiskStorage = require("../providers/DiskStorage")

class DishesController{
  async create(request, response) {
    const { title, description, ingredients, value } = request.body
    //const { filename: imgFilename } = request.file

    const diskStorage = new DiskStorage()
    //const filename = await diskStorage.saveFile(imgFilename)

    console.log(title, description, ingredients, value)
    //console.log(filename);

        if (dish.image) {
      await diskStorage.deleteFile(dish.image)
    }

    const filename = await diskStorage.saveFile(imageFilename)

    const dish_id = await knex("dishes").insert({
      //img: filename,
      title, 
      description,
      value, 
    })

    const ingredientsInsert = ingredients.map(name => {
      return {
        name,
        dish_id
      }
    })

    await knex("ingredients").insert(ingredientsInsert)

    return response.json()
  }

  async show(request, response) {
    const { id } = request.params

    const dish = await knex("dishes").where({ id }).first()
    const ingredients = await knex("ingredients").where({ dish_id: id}).orderBy("name")

    return response.json({
      ...dish,
      ingredients
    })

  }

  async delete(request, response) {
    const { id } = request.params

    await knex("dishes").where({ id }).delete()

    return response.json()
  }

  async index(request, response) {
    const { title, ingredients } = request.query
    const user_id = request.user.id

    let dishes

    if (ingredients) {
      const filterIngredients = ingredients.split(',').map(ingredient => ingredient.trim())

      dishes = await knex("ingredients")
        .select([
          "dishes.id",
          "dishes.image",
          "dishes.title",
          "dishes.description",
          "dishes.value",
          "dishes.user_id"
        ])
        .where("dishes.user_id", user_id)
        .whereLike("dishes.title", `%${title}%`)
        .whereIn("name", filterIngredients)
        .innerJoin("dishes", "dishes.id", "ingredients.dish_id")
        .orderBy("dishes.title")

    } else {
      dishes = await knex("dishes")
        .where({ user_id })
        .whereLike("title", `%${title}%`)
        .orderBy("title")
    }

    const userIngredient = await knex("ingredients").where({ user_id })
    const dishesWithIngredient = dishes.map(dish => {
      const dishIngredient = userIngredient.filter( ingredient => ingredient.dish_id === dish.id)

      return {
        ...dish,
        ingredients: dishIngredient
      }
    })

    return response.json(dishesWithIngredient)
  }

  async update(request, response) {
    const { title, description, ingredients, value } = request.body
    const user_id = request.user.id

    const imageFilename = request.file.filename

    const diskStorage = new DiskStorage()

    const dish = await knex("dishes").where({ id: user_id }).first()
    console.log(dish)

    if (!dish) {
      throw new AppError("Somente administradores podem mudar a foto do prato!", 401)    }

    if (dish.image) {
      await diskStorage.deleteFile(dish.image)
    }

    const filename = await diskStorage.saveFile(imageFilename)
    
    dish.image = filename ?? dish.image
    dish.title = title ?? dish.title
    dish.description = description ?? dish.description
    dish.ingredients = ingredients ?? dish.ingredients
    dish.value = value ?? dish.value

    await knex("dishes").update(dish).where({ id: user_id })

    return response.json()
  }
}

module.exports = DishesController