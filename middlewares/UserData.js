const userData = (req, res, next) => {
    const extractUserData = req.cookies.user ? JSON.parse(req.cookies.user): null
    res.locals.user = extractUserData
    next();
}

module.exports = { userData }
