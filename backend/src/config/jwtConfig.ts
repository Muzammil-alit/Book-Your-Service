import dotenv from "dotenv";

dotenv.config();

const jwtConfig = {
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiration: process.env.JWT_EXPIRATION as string
};

export default jwtConfig;