class ApiCodes extends Error {
  constructor(status, message) {
    super();
    this.status = status
    this.message = message
  }

  static badRequest(message) {
    return new ApiCodes(400, message)
  }
  static internal(message) {
    return new ApiCodes(500, message)
  }
  static notFound(message) {
    return new ApiCodes(404, message)
  }
  static ok(message) {
    return new ApiCodes(200, message)
  }
  static created(message) {
    return new ApiCodes(201, message)
  }
  static noContent(message) {
    return new ApiCodes(204, message)
  }

}

module.exports = ApiCodes