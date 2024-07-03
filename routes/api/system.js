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

        return res.json(resource);
      });
    })
    .catch((error) => {
      console.error(error);
      const message = error[0].value;
      return res.json({ success: false, message: message });
    });
});

module.exports = router;
