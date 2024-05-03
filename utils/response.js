const createReponse = (success, message, data = null, statusCode = 200) => {
    return {
        success: success,
        message: message,
        data: data,
        statusCode: statusCode
    }
}

module.exports = createReponse