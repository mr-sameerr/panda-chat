class Auth {   
    //Check if user is logged or not.
    isLoggedIn = (req, res, next) => {
        //If authenticated, redirect.
        if(req.isAuthenticated()){
            if(req.user.verifiedAt){
                return next()
            }else{
                res.redirect('/email-verification')
            }
        }else{
            //If not then redirect to login
            res.redirect('/login')
        }
    }

    currentUrl = (req, res, next) => {
        res.locals.currentUrl = req.originalUrl
        next()
    }
}

module.exports = new Auth