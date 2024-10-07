exports.googleCallback = async (req, res, next) => {
    try {
        const { user, token } = req.user;
        
        res.cookie('token', token, {
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
          maxAge: 24 * 60 * 60 * 7000 
        });

        res.redirect('http://localhost:3000/profile');
      } catch (err) {
        next(err);
      }
}