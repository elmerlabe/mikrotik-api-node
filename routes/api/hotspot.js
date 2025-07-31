const express = require('express');
const mikronode = require('mikronode');
const { toJsonKeyValue, randomString } = require('../../lib/helpers');
const mkDevice = new mikronode(process.env.MK_IP, process.env.MK_PORT);

const MK_USER = process.env.MK_USER;
const MK_PASS = process.env.MK_PASS;

const router = express.Router();

router.get('/users', async (req, res) => {
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

        channel.close();
        connection.close();

        return res.json({ users: users, count: users.length });
      });
    })
    .catch((error) => {
      console.error(error);
      const message = error[0].value;
      return res.json({ success: false, message: message });
    });
});

router.post('/users/add', async (req, res) => {
  const {
    qty,
    server,
    isUsernameOnly,
    prefix,
    timeLimit,
    dataLimit,
    profile,
    comment,
  } = req.body;

  let name = '';
  password = '';

  mkDevice
    .connect()
    .then(([login]) => {
      return login(MK_USER, MK_PASS);
    })
    .then((connection) => {
      const channel = connection.openChannel();
      //channel.sync(true);

      // Iterate depends on qty
      for (let x = 0; x < qty; x++) {
        let code = randomString('1234567890', 5);

        if (prefix) {
          code = prefix + code;
        }

        if (!isUsernameOnly) {
          name = code;
          password = code;
        } else {
          name = code;
        }

        channel.write('/ip/hotspot/user/add', {
          server,
          name,
          password,
          'limit-uptime': timeLimit,
          profile,
          comment,
        });
      }

      // If failed to add
      channel.on('trap', (response) => {
        // close session
        channel.close();
        connection.close();

        const message = response.data[0].value;
        return res.json({ success: false, message: message });
      });

      // success
      channel.on('done', (response) => {
        const data = response.data;
        channel.close();

        return res.json({ success: true });
      });
    })
    .catch((error) => {
      console.error(error);
      const message = error[0].value;
      return res.json({ success: false, message: message });
    });
});

router.get('/active', async (req, res) => {
  mkDevice
    .connect()
    .then(([login]) => {
      return login(MK_USER, MK_PASS);
    })
    .then((connection) => {
      const channel = connection.openChannel('script');
      channel.write('/ip/hotspot/active/print');

      channel.on('done', (response) => {
        const data = response.data;

        const active = toJsonKeyValue(data);

        channel.close();
        connection.close();

        return res.json(active);
      });
    })
    .catch((error) => {
      console.error(error);
      const message = error[0].value;
      return res.json({ success: false, message: message });
    });
});

router.get('/active/count', async (req, res) => {
  mkDevice
    .connect()
    .then(([login]) => {
      return login(MK_USER, MK_PASS);
    })
    .then((connection) => {
      const channel = connection.openChannel('script');
      channel.write('/ip/hotspot/active/print');

      // If failed to add
      channel.on('trap', (response) => {
        // close session
        channel.close();
        connection.close();

        const message = response.data[0].value;
        return res.json({ success: false, message: message });
      });

      channel.on('done', (response) => {
        const data = response.data;
        const active = toJsonKeyValue(data);

        channel.close();
        connection.close();

        return res.json({ count: active.length });
      });
    })
    .catch((error) => {
      console.error(error);
      const message = error[0].value;
      return res.json({ success: false, message: message });
    });
});

router.post('/sales', async (req, res) => {
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

        const sales = toJsonKeyValue(data);

        sales.forEach((sale) => {
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
      console.error(error);
      const message = error[0].value;
      return res.json({ success: false, message: message });
    });
});

router.post('/sales/log', async (req, res) => {
  console.log(req);

  return res.json({
    success: true,
    message: 'This feature is not implemented yet.',
  });
});

module.exports = router;
