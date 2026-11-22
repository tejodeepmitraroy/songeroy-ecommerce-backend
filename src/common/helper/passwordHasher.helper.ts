import bcrypt from 'bcrypt';
const saltRounds = 10;

// password Hasher
export const passwordHasher = async (password: string) => {
  return await bcrypt.hash(password, saltRounds);
};

//Password compare

export const passwordCompare = async ({
  password,
  hashedPassword,
}: {
  password: string;
  hashedPassword: string;
}) => {
  return await bcrypt.compare(password, hashedPassword);
};
