import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';

const hashPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { password }: { password: string } = req.body;
    const salt: string = await bcrypt.genSalt(10);
    const hashedPassword: string = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    next()
}


const comparePassword = async (hashedPassword: string, userPassword: string) => {
    return new Promise<null>((async (resolve, reject) => {
        const passwordResp: Error | boolean = await bcrypt.compare(userPassword, hashedPassword);

        if (typeof passwordResp === 'boolean') {
            reject('Error while comparing passwords.');
            return
        } else if (passwordResp == false) {
            reject(new Error('Invalid credentials.'));
        } else {
            resolve(null);
        }
    }))
}
