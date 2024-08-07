const express = require('express');
const mikronode = require('mikronode');
const { toJsonKeyValue } = require('../../lib/helpers');
const mkDevice = new mikronode(process.env.MK_IP, process.env.MK_PORT);

const MK_USER = process.env.MK_USER;
const MK_PASS = process.env.MK_PASS;

const router = express.Router();

router.get('/', async (req, res) => {
  const { interface } = req.query;

  if (!interface)
    return res.json({ success: false, message: 'Missing interface param' });

  mkDevice
    .connect()
    .then(([login]) => {
      return login(MK_USER, MK_PASS);
    })
    .then((connection) => {
      const channel = connection.openChannel();
      channel.write('/interface/monitor-traffic', {
        interface,
        once: true,
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
        const interfaces = toJsonKeyValue(data);

        channel.close();
        connection.close();

        return res.json(interfaces[0]);
      });
    })
    .catch((error) => {
      console.error(error);
      const message = error[0].value;
      return res.json({ success: false, message: message });
    });
});

module.exports = router;
