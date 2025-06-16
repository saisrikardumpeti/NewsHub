import mindsDB from "mindsdb-js-sdk";
import { config } from "dotenv";

config();

const MindsDB = mindsDB.default;

const params = {
  "host": "192.168.1.7",
  "port": 5433,
  "database": "news_platform",
  "user": "postgres",
  "password": "password",
};
try {
  await MindsDB.connect({
    host: "http://127.0.0.1:47334",
    user: "",
    password: "",
  });

  const queryResult = await MindsDB.Databases.createDatabase(
    "postgres_conn",
    "postgres",
    params,
  );
} catch (error) {
  console.log(error);
}
