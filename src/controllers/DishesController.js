const knex = require("../database/knex")
const DiskStorage = require("../providers/DiskStorage")

class DishesController{
  async create(request, response) {
    const { title, description, ingredients, price } = request.body
    const { filename: imgFilename } = request.file
    
    const diskStorage = new DiskStorage()
    const filename = await diskStorage.saveFile(imgFilename)
    
    const dishes_id = await knex("dishes").insert({
      img: filename,
      title, 
      description,
      price,
    })

    const ingredientsInsert = ingredients.map((name) => ({
        name,
        dishes_id,
    }))

    await knex("ingredients").insert(ingredientsInsert)

    return response.json()
  }

  async show(request, response) {
    const { id } = request.params

    const dish = await knex("dishes").where({ id }).first()
    const ingredients = await knex("ingredients").where({ dishes_id: id}).orderBy("name")

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
          "dishes.img",
          "dishes.title",
          "dishes.description",
          "dishes.price",
        ])
        .whereLike("dishes.title", `%${title}%`)
        .whereIn("name", filterIngredients)
        .innerJoin("dishes", "dishes.id", "ingredients.dishes_id")
        .orderBy("dishes.title")

    } else {
      dishes = await knex("dishes")
        .whereLike("title", `%${title}%`)
        .orderBy("title")
    }

    const listIngredients = await knex("ingredients")

    const dishesWithIngredient = dishes.map(dish => {
      const dishIngredients = listIngredients.filter( ingredient => ingredient.dishes_id === dish.id)

      return {
        ...dish,
        ingredients: dishIngredients
      }
    })

    return response.json(dishesWithIngredient)
  }

  async update(request, response) {
    const { title, description, ingredients, price } = request.body
    const { filename: imgFilename } = request.file
    const { id } = request.params;

    const diskStorage = new DiskStorage()
    const filename = await diskStorage.saveFile(imgFilename)

    const dish = await knex("dishes").where({ id }).first()

    if(dish.img) {
      await diskStorage.deleteFile(dish.img)
    }
    
    dish.img = filename ?? dish.img
    dish.title = title ?? dish.title
    dish.description = description ?? dish.description
    dish.price = price ?? dish.price

    const ingredientsInsert = ingredients.map(name => ({
        name,
        dishes_id: dish.id,
    }))

    await knex("dishes").where({id}).update(dish)
    await knex("ingredients").where({dishes_id: id}).delete()
    await knex("ingredients").insert(ingredientsInsert)

    return response.json()
  }
}

module.exports = DishesController