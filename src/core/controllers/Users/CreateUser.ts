import { User } as from '../../core/entities/User';
import { getRepository } from 'typeorm';
import { hashPassword } from '../../utils/passwordUtils';  // Assume this utility hashes passwords

interface CreateUserRequest {
    username: string;
    email: string;
    password: string;
}

class CreateUser {
    async execute(createUserRequest: CreateUserUserCode): Promise<User> {
        const userRepository = getRepository(User);
        const { username, email, password } = createUserRequest;

        const existingUser = await userRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new Error('Email already in use');
        }

        const hashedPassword = await hashPassword(password);
        const newUser = userRepository.create({
            username,
            email,
            password: hashedPassword
        });

        await userRepository.save(newUser);
        return newUser;
    }
}

export default CreateUser;
