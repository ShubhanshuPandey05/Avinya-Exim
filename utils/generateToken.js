import jwt from "jsonwebtoken";

const genrateTokenAndSetCookies = (userId,res) => {
    const token = jwt.sign({userId},process.env.SECRET, {
        expiresIn: "999d"
    });

    res.cookie("jwt", token, {
        path: "/",
        maxAge: 999 * 24 * 60 * 60 * 1000, // 999 days in milliseconds
        httpOnly: true,
        sameSite: "None",
        secure: true  // Required when sameSite is "None"
      });
      
    return token;

}

export default genrateTokenAndSetCookies;