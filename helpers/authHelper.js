import bcrypt from "bcrypt";


// function for encrypting/hashing the password ofr the first time
export const hashPassword = async (password) => {
  try {
    const saltRounds = 10;      // no. of rounds for encryption
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.log(error);
  }
};

// function for comparing passwords. Be careful of 'hashPassword' (the function above) and 'hashedPassword'
export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};