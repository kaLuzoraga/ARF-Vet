const isAdmin = (req, res, next) => {
    const user = req.session?.user;

    if (!user || user.userType !== "admin") {
        return res.status(403).send("Access denied. Admins only.");
    }

    next();
};

export default isAdmin;