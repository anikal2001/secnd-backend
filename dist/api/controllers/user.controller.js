"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const tslib_1 = require("tslib");
const user_service_1 = require("../../infrastructure/services/user.service");
class UserController {
    constructor() {
        // @Middleware(validateUserFields)
        // @Get('/users')
        this.createUser = (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password, firstName, lastName, country, city, address, postalCode, phone, avatar } = req.body;
                const user = yield this.userService.createUser(email, password, firstName, lastName, country, city, address, postalCode, phone, avatar);
                res.status(200).json(user);
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
        this.getAllUsers = (_req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield this.userService.getAllUsers();
                res.json(users);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
        this.updateUser = (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const updatedUser = yield this.userService.updateUser(Number(req.params.id), req.body);
                if (updatedUser) {
                    res.json(updatedUser);
                }
                else {
                    res.status(404).json({ message: 'User not found' });
                }
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
        this.loginUser = (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const token = yield this.userService.authenticateUser(email, password);
                res.json({ token });
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
        this.changePassword = (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const { currentPassword, newPassword, confirmPassword } = req.body;
                const id = Number(req.params.id);
                const message = yield this.userService.changePassword(id, currentPassword, newPassword, confirmPassword);
                res.json({ message });
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
        this.userService = new user_service_1.UserService();
    }
}
exports.UserController = UserController;
// const createUser = async (req: Request, res: Response) => {
//   try {
//     const user = new User()
//     const email = req.body.email
//     const ChkUser = await User.findBy({
//       email: email,
//     })
//     if (ChkUser) return res.status(400).json('user already exists')
//     const salt = await bcrypt.genSalt(10)
//     const hashedPassword = await bcrypt.hash(req.body.password, salt)
//     user.password = hashedPassword
//     user.email = email
//     user.firstName = req.body.firstName
//     user.lastName = req.body.lastName
//     user.country = req.body.country
//     user.city = req.body.city
//     user.address = req.body.address
//     user.postalCode = req.body.postalCode
//     user.phone = req.body.phone
//     if (req.body.avatar) user.avatar = req.body.avatar
//     else user.avatar = ''
//     await user.save()
//     const token = jwt.sign({ _id: user }, config.JWT_SECERT as string, {
//       expiresIn: config.EXPIRES_IN,
//     })
//     res.header('x-auth-header', token)
//     res.status(200).json('user added successfully')
//   } catch (err) {
//     res.status(500).json({ message: 'Internal server error: ', err })
//   }
// }
// const authUser = async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body
//     const user = (await User.findBy({ email: email })) as any
//     if (!user) return res.status(404).json('user credentionals')
//     if (!bcrypt.compareSync(password, user.password))
//       return res.status(404).json('Wrong credentionals')
//     const token = jwt.sign({ _id: user }, config.JWT_SECERT as string, {
//       expiresIn: config.EXPIRES_IN,
//     })
//     res.header('x-auth-header', token)
//   } catch (err) {
//     res.status(500).json({ message: 'Internal server error: ', err })
//   }
// }
