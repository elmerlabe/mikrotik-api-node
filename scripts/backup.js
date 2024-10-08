const mikronode = require('mikronode');
const { toJsonKeyValue } = require('../lib/helpers');
const fs = require('fs');
const mkDevice = new mikronode(process.env.MK_IP, process.env.MK_PORT);

const MK_USER = process.env.MK_USER;
const MK_PASS = process.env.MK_PASS;

const dT = new Date();
const monArray = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const dateNow = `${
  monArray[dT.getMonth()]
} ${dT.getDate()} ${dT.getFullYear()}`;
const timeNow = `${dT.getHours()}:${dT.getMinutes()}:${dT.getSeconds()}`;
const timeStamp = `${dateNow} ${timeNow}`;

const backupHotspotSales = async () => {
  // Get hotspot sales from mikrotik scripts
  mkDevice
    .connect()
    .then(([login]) => {
      return login(MK_USER, MK_PASS);
    })
    .then((connection) => {
      const channel = connection.openChannel();
      channel.write('/system/script/print', ['?comment=mikhmon']);

      // If failed to execute script
      channel.on('trap', (response) => {
        // close session
        channel.close();
        connection.close();

        const message = response.data[0].value;
        console.log(message);
      });

      channel.on('done', (response) => {
        const data = response.data;
        const scripts = toJsonKeyValue(data);
        const header = `date,time,code,amount,ip,mac,timeLimit,profile,comment\n`;
        let dataSales = '';

        scripts.forEach((sale) => {
          const report = sale.name;
          const [
            date,
            time,
            code,
            amount,
            ip,
            mac,
            timeLimit,
            profile,
            comment,
          ] = report.split('-|-');

          dataSales += `${date},${time},${code},${amount},${ip},${mac},${timeLimit},${profile},${comment}\n`;
        });

        const writeData = `${header}${dataSales}`;

        const dir = './logs';
        const fileName = `${dateNow.replaceAll(' ', '_')}_sales_backup.csv`;
        const path = `${dir}/${fileName}`;

        // create folder if not exist
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }

        // Check file if not exist then write
        if (!fs.existsSync(path)) {
          console.log('File is not exist, writing file...');

          // Write data to csv file
          fs.writeFile(path, writeData, 'utf-8', (err) => {
            if (err) console.error(err);
            else console.log(`${timeStamp} | Sales successfully backup `);
          });
        }

        channel.close();
        connection.close();
      });
    })
    .catch((error) => {
      console.error(error);
    });
};

const backupHotspotUsers = async () => {
  mkDevice
    .connect()
    .then(([login]) => {
      return login(MK_USER, MK_PASS);
    })
    .then((connection) => {
      const channel = connection.openChannel('script');
      channel.write('/ip/hotspot/user/print');

      channel.on('done', (response) => {
        const data = response.data;

        const users = toJsonKeyValue(data);
        const header = `name,password,profile,limit-uptime,uptime,bytes-in,bytes-out,packets-in,packets-out,dynamic,disabled,comment\n`;
        let usersData = '';

        users.forEach((user) => {
          const {
            name,
            password,
            profile,
            'limit-uptime': limitUptime,
            uptime,
            'bytes-in': bytesIn,
            'bytes-out': bytesOut,
            'packets-in': packetsIn,
            'packets-out': packetsOut,
            dynamic,
            disabled,
            comment,
          } = user;

          usersData += `${name},${password},${profile},${limitUptime},${uptime},${bytesIn},${bytesOut},${packetsIn},${packetsOut},${dynamic},${disabled},${comment}\n`;
        });

        const writeData = `${header}${usersData}`;

        const dir = './logs';
        const fileName = `${dateNow.replaceAll(' ', '_')}_HOTSPOT_USERS.csv`;
        const path = `${dir}/${fileName}`;

        // create folder if not exist
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }

        // Check file if not exist then write
        if (!fs.existsSync(path)) {
          console.log('File is not exist, writing file...');

          // Write data to csv file
          fs.writeFile(path, writeData, 'utf-8', (err) => {
            if (err) console.error(err);
            else
              console.log(`${timeStamp} | Hotspot users successfully backup `);
          });
        }

        channel.close();
        connection.close();
      });
    })
    .catch((error) => {
      console.error(error);
    });
};

module.exports = { backupHotspotSales, backupHotspotUsers };
