const erroHandler = (err, req, res, next) => {

    // const statusCode = res.statusCode ? res.statusCode : 500
    res.status(400).json({
        message: err.message,//err.message and err.stack is already present in express error inbuit handler
        stack: err.stack
    })

    next()
}

module.exports = erroHandler