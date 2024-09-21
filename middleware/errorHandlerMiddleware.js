const erroHandler = (err, req, res, next) => {

    const statusCode = res.statusCode ?? 400
    res.status(statusCode).json({
        message: err.message,//err.message and err.stack is already present in express error inbuit handler
        stack: err.stack
    })

    next()
}

module.exports = erroHandler