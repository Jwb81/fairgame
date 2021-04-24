const { spawn, exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const products = require("./products");

const productsToRun = Object.entries(products).reduce((acc, [key, value]) => {
  if (value.run) {
    acc[key] = value;
  }

  return acc;
}, {});

let spawns = {};

const run = async () => {
  try {
    const batDirectoryPath = path.resolve(__dirname, "..");
    const tempConfigDirectoryPath = path.resolve(
      __dirname,
      "..",
      "config",
      "temp"
    );

    // clear the temp config files
    fs.rmdirSync(tempConfigDirectoryPath, { recursive: true });

    for (const productName in productsToRun) {
      const productInfo = productsToRun[productName];

      // Object.entries(productsToRun).forEach(([productName, productInfo]) => {
      // loop through each product

      for (const asin of productInfo.asins) {
        // productInfo.asins.forEach(async (asin) => {
        const spawnName = `${productName}_${asin}`;
        const filename = `${spawnName}.json`;
        const batFileName = `__${spawnName}.bat`;
        const filePath = path.resolve(tempConfigDirectoryPath, filename);
        const batFilePath = path.resolve(batDirectoryPath, batFileName);
        const pathFromConfigFolder = `temp/${filename}`;

        const config = {
          asin_groups: 1,

          asin_list_1: [asin],
          reserve_min_1: productInfo.min,
          reserve_max_1: productInfo.max,

          amazon_website: "smile.amazon.com",
        };

        // create the config directory if it DNE
        if (!fs.existsSync(tempConfigDirectoryPath)) {
          fs.mkdirSync(tempConfigDirectoryPath);
        }

        //   write the config file to the config folder
        fs.writeFileSync(filePath, JSON.stringify(config, null, 2));

        console.log({ pathFromConfigFolder });

        //   const nextSpawn = spawn(
        //     `cmd /k pipenv run python ../app.py amazon --headless --p=Futbol.14 --delay 0 --config-filename "${filePath.replace(
        //       /\\/g,
        //       "/"
        //     )}"`
        //   );
        const commandOptions = [
          "/k",
          "pipenv",
          "run",
          "python",
          "app.py",
          "amazon",
          // "--headless",
          "--p=Futbol.14",
          "--delay",
          "0",
          "--config-filename",
          pathFromConfigFolder,
          // "rtx_3080/rtx_3080_evga_ftw3.json",
        ];

        const batCommand = `start cmd ${commandOptions.join(" ")}`;
        fs.writeFileSync(batFilePath, batCommand, null, 2);

        console.log({ batFilePath, batFileName });

        const nextSpawn = spawn(`${batFileName}`, {
          shell: true,
        });
        // const nextSpawn = spawn(`start cmd`, ["/c", `${batFileName}`], {
        //   shell: true,
        // });
        // const nextSpawn = exec(`cmd /c ${batFileName}`);

        // const nextSpawn = spawn(`cmd /k`, commandOptions);
        // const nextSpawn = exec(`cmd ${commandOptions.join(' ')}`);

        // nextSpawn.stdout.on("data", (data) => {
        //   console.log(`stdout: ${spawnName} : ${data}`);
        // });

        // nextSpawn.stderr.on("data", (data) => {
        //   console.log(`stderr: ${spawnName} : ${data}`);
        // });

        // nextSpawn.on("error", (error) => {
        //   console.log(`error: ${spawnName} : ${error.message}`);
        // });

        // nextSpawn.on("close", (code) => {
        //   console.log(
        //     `close: ${spawnName} : child process exited with code ${code}`
        //   );
        // });

        console.log("waiting for some time to pass...");
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // spawns[spawnName] = nextSpawn;
      }
    }
  } catch (error) {
    console.log({ error });
  }
};

run();
