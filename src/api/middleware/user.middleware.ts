import { body, validationResult, ValidationChain } from 'express-validator';
import express, { Request, Response, NextFunction } from 'express';

const emailValidations = (email: string) => {
  return body('email')
    .exists()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Email is not valid.')
    .isLength({ max: 50 })
    .withMessage('Email cannot be more than 50 characters long.');
};

const usernameValidations = (username: string) => {
  return body('username')
    .exists()
    .withMessage('Username is required.')
    .isAlphanumeric()
    .isLength({ min: 6 })
    .withMessage('Username must be at least 3 characters long.')
    .isLength({ max: 24 })
    .withMessage('Username cannot be more than 50 characters long.');
};

const firstNameValidations = (firstName: string) => {
  return body('firstName')
    .exists()
    .withMessage('First name is required.')
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters long.')
    .isLength({ max: 50 })
    .withMessage('First name cannot be more than 50 characters long.');
};

const lastNameValidations = (lastName: string) => {
  return body('lastName')
    .exists()
    .withMessage('Last name is required.')
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters long.')
    .isLength({ max: 50 })
    .withMessage('Last name cannot be more than 50 characters long.');
};

// TODO: Add city validations
const cityValidations = (city: string) => {
  return body('city')
    .exists()
    .withMessage('City is required.')
    .isLength({ min: 2 })
    .withMessage('City must be at least 2 characters long.')
    .isLength({ max: 50 })
    .withMessage('City cannot be more than 50 characters long.');
};

// TODO: Add postal code validations
const postalCodeValidations = (postalCode: string) => {
  return body('postalCode')
    .exists()
    .withMessage('Postal code is required.')
    .isLength({ min: 6 })
    .withMessage('Postal code must be at least 6 characters long.')
    .isLength({ max: 50 })
    .withMessage('Postal code cannot be more than 50 characters long.');
};

//TODO: Add address validations
const addressValidations = (address: string) => {
  return body('address')
    .exists()
    .withMessage('Address is required.')
    .isLength({ min: 6 })
    .withMessage('Address must be at least 6 characters long.')
    .isLength({ max: 50 })
    .withMessage('Address cannot be more than 50 characters long.');
};

// TODO: Add phone validations
const phoneValidations = (phone: string) => {
  return body('phone')
    .exists()
    .withMessage('Phone is required.')
    .isLength({ min: 6 })
    .withMessage('Phone must be at least 6 characters long.')
    .isLength({ max: 50 })
    .withMessage('Phone cannot be more than 50 characters long.');
};

// TODO: Add avatar validations
const avatarValidations = (avatar: string) => {
  return body('avatar').exists().withMessage('Avatar is required.');
};

export const passwordValidations = (password: string) => {
  return body('password')
    .exists()
    .withMessage('Password is required.')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.')
    .isLength({ max: 50 })
    .withMessage('Password cannot be more than 50 characters long.')
    .matches(/\d/)
    .withMessage('Password must contain at least one number.')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('Password must contain at least one special character.')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter.')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter.');
};

export const validateUserFields = async (req: Request, res: Response, next: NextFunction) => {
  console.log('validating');

  const validations: ValidationChain[] = [
    //@ts-expect-error error1
    emailValidations(),
    //@ts-expect-error error1
    usernameValidations(),
    // passwordValidations(req.body.password),
    // addressValidations(req.body.address),
    // cityValidations(req.body.city),
    // postalCodeValidations(req.body.postalCode)
  ];

  for (const validation of validations) {
    const result = await validation.run(req);

    if (!result.isEmpty()) break;
  }

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next();
  }

  res.status(500).json({ message: 'Validation failed', errors: errors.array()[0].msg });
};
