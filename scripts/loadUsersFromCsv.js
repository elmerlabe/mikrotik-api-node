require("dotenv").config();

const mikronode = require("mikronode");
const fs = require("fs");
const csv = require("csv-parser");
const mkDevice = new mikronode(process.env.MK_IP, process.env.MK_PORT);

const MK_USER = process.env.MK_USER;
const MK_PASS = process.env.MK_PASS;

const loadUsersFromCsv = async () => {
  console.log("Performing user backup...");

  // read 
  const filePath = process.argv[2];

  // check file if has csv extension
  if (!filePath.includes(".csv"))
    return console.error("Error: Invalid csv file");

  let HS_USERS = [];

  // read csv file
  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => {
      const comment = data.comment.toLowerCase();

      if (comment.includes("jackilou3h")) {
        HS_USERS.push(data);
      }
    })
    .on("end", () => {
      console.log("File reading done!");
      console.log("Total len: ", HS_USERS.length);
    });

  // Connect to mikrotik
  await mkDevice
    .connect()
    .then(([login]) => {
      return login(MK_USER, MK_PASS);
    })
    .then((connection) => {
      const channel = connection.openChannel();
      let count = 1;

      // add user
      HS_USERS.map((user) => {
        const {
          name,
          password,
          profile,
          "limit-uptime": limitUptime,
          comment,
        } = user;

        channel.write("/ip/hotspot/user/add", {
          server: "all",
          name,
          password,
          profile,
          "limit-uptime": limitUptime,
          comment,
        });
      });

      channel.on("done", (response) => {
        // close channel & connection after all the users added
        if (count === HS_USERS.length) {
          channel.close();
          connection.close();
        } else {
          count++;
        }
      });

      channel.on("trap", (response) => {
        console.log(response);
      });
    })
    .catch((error) => {
      console.error(error);
    });
};

loadUsersFromCsv();

module.exports = loadUsersFromCsv;
