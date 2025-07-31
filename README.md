# mikrotik-api-node

This app developed to monitor hotspot sales, pppoe and generate user codes in mikrotik router through api (using mikronode).

Note: Change the line of code in mikronode.js at line 358 using the code below, this will fix the login issue

//Login fix routerOS 6.43 up
stream.write(["/login", "=name=" + user, "=password=" + password, "=response=00" + md5.digest("hex")]);

//Add the script below to all hotspot user profiles onLogin script
//Make sure to paste this at the top (line 0)
```
# Send request to external API to log hotspot sales
:local comment [ /ip hotspot user get [/ip hotspot user find where name="$user"] comment];
:local ucode [:pic $comment 0 2];
:if ($ucode = "vc" or $ucode = "up" or $comment = "") do={
  :local mac $"mac-address";
  :local time [/system clock get time ];
  :local date [ /system clock get date ];
  :local apiUrl "http://192.168.3.254:4000/api/hotspot/sales/log"; #change ip based on the api server address
  :local data "date=$date&time=$time&code=$user&ip=$address&mac=$mac&comment=$comment&amount=5&profile=3HRS";
  tool fetch url=$apiUrl http-method=post http-data=$data keep-result=no;
}
```