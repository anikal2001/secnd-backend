import { User } from '../../entity/user.model';
import AppDataSource from '../../../infrastructure/db/database';
import { hashPassword } from '../../../utils/passwordUtils';
import { validateUserFields } from '../../../api/middleware/user.middleware';


interface CreateUserRequest {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    postalCode: string;
    address: string;
    city: string;
}

class CreateUser {

    private userRepository;
    // TODO: Update type according to typeorm
    constructor(userRepository: any) {
        this.userRepository = userRepository;
    }
    async execute(createUserRequest: CreateUserRequest): Promise<User> {
        const { username, email, password, firstName, lastName, postalCode, address, city } = createUserRequest;

        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new Error('Email already in use');
        }

        const hashedPassword = await hashPassword(password);
        const newUser = this.userRepository.create({
            username,
            firstName,
            lastName,
            postalCode,
            address,
            city,
            email,
            password: hashedPassword
        });

        await this.userRepository.save(newUser);
        return newUser;
    }
}

export default CreateUser;
