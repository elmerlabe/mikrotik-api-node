const express = require('express');
const mikronode = require('mikronode');
const { toJsonKeyValue } = require('../../lib/helpers');
const mkDevice = new mikronode(process.env.MK_IP, process.env.MK_PORT);

const MK_USER = process.env.MK_USER;
const MK_PASS = process.env.MK_PASS;

const router = express.Router();

router.get('/active', async (req, res) => {
  mkDevice
    .connect()
    .then(([login]) => {
      return login(MK_USER, MK_PASS);
    })
    .then((connection) => {
      const channel = connection.openChannel('script');
      channel.write('/ppp/active/print');

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
      channel.write('/ppp/active/print');

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

router.get('/secrets', async (req, res) => {
  mkDevice
    .connect()
    .then(([login]) => {
      return login(MK_USER, MK_PASS);
    })
    .then((connection) => {
      const channel = connection.openChannel('script');
      channel.write('/ppp/secret/print');

      channel.on('done', (response) => {
        const data = response.data;
        const secrets = toJsonKeyValue(data);

        channel.close();
        connection.close();

        return res.json(secrets);
      });
    })
    .catch((error) => {
      console.error(error);
      const message = error[0].value;
      return res.json({ success: false, message: message });
    });
});

router.post('/secrest/add', async (req, res) => {
  const { name, password, profile, comment } = req.body;
  const service = 'pppoe';

  mkDevice
    .connect()
    .then(([login]) => {
      return login(MK_USER, MK_PASS);
    })
    .then((connection) => {
      const channel = connection.openChannel('script');
      channel.write('/ppp/secret/add', {
        name,
        password,
        service,
        profile,
        comment,
      });

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
        const id = data[0];
        console.log(data[0]);

        channel.close();
        connection.close();

        return res.json({ success: true, id: id });
      });
    })
    .catch((error) => {
      console.error(error);
      const message = error[0].value;
      return res.json({ success: false, message: message });
    });
});

router.get('/profiles', async (req, res) => {
  mkDevice
    .connect()
    .then(([login]) => {
      return login(MK_USER, MK_PASS);
    })
    .then((connection) => {
      const channel = connection.openChannel('script');
      channel.write('/ppp/profile/print');

      channel.on('done', (response) => {
        const data = response.data;
        const profiles = toJsonKeyValue(data);

        channel.close();
        connection.close();

        return res.json(profiles);
      });
    })
    .catch((error) => {
      console.error(error);
      const message = error[0].value;
      return res.json({ success: false, message: message });
    });
});

router.get('/interfaces', async (req, res) => {
  mkDevice
    .connect()
    .then(([login]) => {
      return login(MK_USER, MK_PASS);
    })
    .then((connection) => {
      const channel = connection.openChannel('script');
      channel.write('/interface/print', ['?type=pppoe-in']);

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
        const interfaces = toJsonKeyValue(data);

        channel.close();
        connection.close();

        return res.json(interfaces);
      });
    })
    .catch((error) => {
      console.error(error);
      const message = error[0].value;
      return res.json({ success: false, message: message });
    });
});

module.exports = router;
