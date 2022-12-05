

function adminAuthenticated(request, response, next) {
  if (!request.body.isAdmin) {
    return response.json({ message: "User unauthorized"})
  }

  next()
}

module.exports = adminAuthenticated