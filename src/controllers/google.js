exports.googleCallback = async (req, res, next) => {
    try {
        const { user, token } = req.user;
        
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        
        res.redirect('http://localhost:3000/profile');
      } catch (err) {
        next(err);
      }
}