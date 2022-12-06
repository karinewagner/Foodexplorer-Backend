const knex = require("../database/knex")
const DiskStorage = require("../providers/DiskStorage")

class DishesController{
  async create(request, response) {
    const { title, description, ingredients, value } = request.body
    const { filename: imageFilename } = request.file
    const user_id = request.user.id
     
    const diskStorage = new DiskStorage()
    const filename = await diskStorage.saveFile(imageFilename)
    
    const dish_id = await knex("dishes").insert({
      image: filename,
      title, 
      description,
      value,
      user_id
    })

    const ingredientsInsert = ingredients.map((name) => ({
        name,
        dish_id,
    }))

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
        ])
        .whereLike("dishes.title", `%${title}%`)
        .whereIn("name", filterIngredients)
        .innerJoin("dishes", "dishes.id", "ingredients.dish_id")
        .orderBy("dishes.title")

    } else {
      dishes = await knex("dishes")
        .whereLike("title", `%${title}%`)
        .orderBy("title")
    }

    const userIngredient = await knex("ingredients")
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
    const { filename: imageFilename,  } = request.file
    const { id } = request.params;

    const diskStorage = new DiskStorage()

    const dish = await knex("dishes").where({ id }).first()

    const filename = await diskStorage.saveFile(imageFilename)
    
    dish.image = filename ?? dish.image
    dish.title = title ?? dish.title
    dish.description = description ?? dish.description
    dish.value = value ?? dish.value
    
    const ingredientsInsert = ingredients.map((name) => ({
        name,
        dish_id: dish.id,
    }))

    await knex("dishes").where({id}).update(dish)
    await knex("ingredients").where({dish_id: id}).delete()
    await knex("ingredients").insert(ingredientsInsert)

    return response.json()
  }
}

module.exports = DishesController