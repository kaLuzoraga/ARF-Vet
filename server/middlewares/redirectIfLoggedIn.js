const redirectIfLoggedIn = (req, res, next) => {
    if (req.session && req.session.user) {
        
        if (req.session.user.userType === "admin") {
            return res.redirect("/admin/adminmenu");
        } else {
            return res.redirect("/home");
        }
    }
    next();
};

export default redirectIfLoggedIn;