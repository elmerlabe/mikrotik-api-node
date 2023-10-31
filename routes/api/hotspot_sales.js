const express = require('express');
const mikronode = require('mikronode');
const mkDevice = new mikronode(process.env.MK_IP, process.env.MK_PORT);

const MK_USER = process.env.MK_USER;
const MK_PASS = process.env.MK_PASS;

const router = express.Router();

router.post('/', async (req, res) => {
  const { dateFrom, dateTo } = req.body;

  mkDevice
    .connect()
    .then(([login]) => {
      return login(MK_USER, MK_PASS);
    })
    .then((connection) => {
      //console.log('Logged in...');

      const dateFromObj = new Date(
        dateFrom.split('-')[0],
        dateFrom.split('-')[1] - 1,
        dateFrom.split('-')[2]
      );

      const dateToObj = new Date(
        dateTo.split('-')[0],
        dateTo.split('-')[1] - 1,
        dateTo.split('-')[2]
      );

      const channel = connection.openChannel('script');
      channel.write('/system/script/print', ['?comment=mikhmon']);

      channel.on('done', (response) => {
        const data = response.data;
        let salesReport = [];

        data.forEach((element) => {
          const report = element[2].value;
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

          const monArray = [
            'jan',
            'feb',
            'mar',
            'apr',
            'may',
            'jun',
            'jul',
            'aug',
            'sep',
            'oct',
            'nov',
            'dec',
          ];

          //new Date(year, month, day)
          //Split date from script ex. 'oct/01/2023'
          const dateObj = new Date(
            date.split('/')[2],
            monArray.indexOf(date.split('/')[0]),
            date.split('/')[1]
          );

          if (dateObj >= dateFromObj && dateObj <= dateToObj) {
            salesReport.push({
              date: date,
              time: time,
              code: code,
              amount: amount,
              ip: ip,
              mac: mac,
              timeLimit: timeLimit,
              profile: profile,
              comment: comment,
            });
          }
        });

        channel.close();
        connection.close();

        return res.json(salesReport);
      });
    })
    .catch((error) => {
      console.log(error);
    });
});

module.exports = router;
