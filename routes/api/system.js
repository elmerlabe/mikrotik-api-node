const express = require('express');
const mikronode = require('mikronode');
const { toJsonKeyValue } = require('../../lib/helpers');
const mkDevice = new mikronode(process.env.MK_IP, process.env.MK_PORT);

const MK_USER = process.env.MK_USER;
const MK_PASS = process.env.MK_PASS;

const router = express.Router();

router.get('/resource', async (req, res) => {
  mkDevice
    .connect()
    .then(([login]) => {
      return login(MK_USER, MK_PASS);
    })
    .then((connection) => {
      const channel = connection.openChannel('script');
      channel.write('/system/resource/print');

      channel.on('done', (response) => {
        const data = response.data;
        const resource = toJsonKeyValue(data);

        channel.close();
        connection.close();

        return res.json(resource[0]);
      });
    })
    .catch((error) => {
      console.error(error);
      const message = error[0].value;
      return res.json({ success: false, message: message });
    });
});

router.get('/clock', async (req, res) => {
  mkDevice
    .connect()
    .then(([login]) => {
      return login(MK_USER, MK_PASS);
    })
    .then((connection) => {
      const channel = connection.openChannel('script');
      channel.write('/system/clock/print');

      channel.on('done', (response) => {
        const data = response.data;
        const clock = toJsonKeyValue(data);

        channel.close();
        connection.close();

        return res.json(clock[0]);
      });
    })
    .catch((error) => {
      console.error(error);
      const message = error[0].value;
      return res.json({ success: false, message: message });
    });
});

router.get('/routerboard', async (req, res) => {
  mkDevice
    .connect()
    .then(([login]) => {
      return login(MK_USER, MK_PASS);
    })
    .then((connection) => {
      const channel = connection.openChannel('script');
      channel.write('/system/routerboard/print');

      channel.on('done', (response) => {
        const data = response.data;
        const routerboard = toJsonKeyValue(data);

        channel.close();
        connection.close();

        return res.json(routerboard[0]);
      });
    })
    .catch((error) => {
      console.error(error);
      const message = error[0].value;
      return res.json({ success: false, message: message });
    });
});

router.get('/health', async (req, res) => {
  mkDevice
    .connect()
    .then(([login]) => {
      return login(MK_USER, MK_PASS);
    })
    .then((connection) => {
      const channel = connection.openChannel();
      channel.write('/system/health/print');

      channel.on('done', (response) => {
        const data = response.data;
        const health = toJsonKeyValue(data);

        channel.close();
        connection.close();

        return res.json(health[0]);
      });
    })
    .catch((error) => {
      console.error(error);
      const message = error[0].value;
      return res.json({ success: false, message: message });
    });
});

router.get('/logs/hotspot', async (req, res) => {
  mkDevice
    .connect()
    .then(([login]) => {
      return login(MK_USER, MK_PASS);
    })
    .then((connection) => {
      const channel = connection.openChannel();
      channel.write('/log/print', ['?topics=hotspot,info,debug']);

      channel.on('done', (response) => {
        const data = response.data;
        const logs = toJsonKeyValue(data);

        channel.close();
        connection.close();

        const logsWithPrefix = logs
          .filter((log) => log.message.includes('->'))
          .reverse();

        return res.json({ logs: logsWithPrefix, count: logsWithPrefix.length });
      });
    })
    .catch((error) => {
      console.error(error);
      const message = error[0].value;
      return res.json({ success: false, message: message });
    });
});

router.get('/logs/pppoe', async (req, res) => {
  mkDevice
    .connect()
    .then(([login]) => {
      return login(MK_USER, MK_PASS);
    })
    .then((connection) => {
      const channel = connection.openChannel();
      channel.write('/log/print', ['?topics=pppoe,ppp,info']);

      channel.on('done', (response) => {
        const data = response.data;
        const logs = toJsonKeyValue(data);

        channel.close();
        connection.close();

        return res.json(logs);
      });
    })
    .catch((error) => {
      console.error(error);
      const message = error[0].value;
      return res.json({ success: false, message: message });
    });
});

module.exports = router;
