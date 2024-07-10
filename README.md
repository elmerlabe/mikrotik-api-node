# mikrotik-api-node

This app developed to monitor hotspot sales, pppoe and generate user codes in mikrotik router through api (using mikronode).

Note: Change the line of code in mikronode.js at line 358 using the code below, this will fix the login issue

//Login fix routerOS 6.43 up
stream.write(["/login", "=name=" + user, "=password=" + password, "=response=00" + md5.digest("hex")]);
