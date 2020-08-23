import dotenv from "dotenv";

const envFound = dotenv.config();

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || "development";

if (!envFound) {
  // This error should crash whole process
  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

export default {
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT,
  hostUrl: process.env.HOST_URL,
  mongoUri: process.env.MONGO_URI,
  session: {
    name: process.env.SESSION_NAME,
    secret: process.env.SESSION_SECRET,
    lifeTime: process.env.SESSION_LIFETIME,
  },
  signaturit: process.env.SIGNATURIT,
  emailOwner: {
    email: process.env.EMAIL,
    emailPassword: process.env.EMAIL_PW,
  },
  plotly: {
    user: process.env.PLOTLY_USER,
    key: process.env.PLOTLY_KEY,
  },
  nubefactToken: process.env.NUBEFACT_TOKEN,
  culqiPrivate: process.env.CULQI_PRIVATE,
  culqiHostUrl: process.env.CULQI_HOST_URL,
  production: {
    buildPath: process.env.BUILD_PATH,
    cert: process.env.CERT,
    key: process.env.KEY,
    portHttps: process.env.PORT_HTTPS,
  },
  invitation: {
    firstTemplateUrl: process.env.INVITATION_URL_FIRST_TEMPLATE,
    secondTemplateUrl: process.env.INVITATION_URL_SECOND_TEMPLATE,
    firstNameTemplate: process.env.INVITATION_NAME_FIRST_TEMPLATE,
    secondNameTemplate: process.env.INVITATION_NAME_SECOND_TEMPLATE,
  },
  analytics: {
    baseUrl: process.env.ANALYTICS_BASE_URL,
  },
};
