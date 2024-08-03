let downloadRateArr = [];
let uploadRateArr = [];

const fetchSystemResource = () => {
  $.ajax({
    url: '/api/system/resource',
    type: 'get',
    success: (data) => {
      let {
        uptime,
        version,
        'cpu-load': cpuLoad,
        'free-memory': freeMemory,
        'free-hdd-space': freeHdd,
        'cpu-count': cpuCount,
        'cpu-frequency': cpuFreq,
        'total-memory': totalMemory,
        'total-hdd-space': totalHdd,
      } = data;

      // convert to Mebibit (MiB)
      freeHdd = (freeHdd / 1049000).toFixed(2);
      freeMemory = (freeMemory / 1049000).toFixed(2);
      totalMemory = (totalMemory / 1049000).toFixed(2);
      totalHdd = (totalHdd / 1049000).toFixed(2);

      // Update element values
      $('#mtUptime').text(uptime);
      $('#mtOsVer').text(version);
      $('#mtCpu').text(`${cpuLoad}% ${cpuCount}x ${cpuFreq} Mhz `);
      $('#mtFreeMem').text(`${freeMemory} MiB / ${totalMemory} MiB`);
      $('#mtFreeHdd').text(`${freeHdd} MiB / ${totalHdd} MiB`);

      fetchSystemBoard();

      // calculate progress bar %
      const cpuBar = document.getElementById('cpuBar');
      const memBar = document.getElementById('memBar');
      const hddBar = document.getElementById('hddBar');

      let memBarPercent = 100 - (freeMemory / totalMemory) * 100;
      let hddBarPercent = 100 - (freeHdd / totalHdd) * 100;

      cpuBar.style.width = `${cpuLoad}%`;
      memBar.style.width = `${memBarPercent}%`;
      hddBar.style.width = `${hddBarPercent}%`;

      // change progress bar color based on percent
      changeProgressBarColor(cpuBar, cpuLoad);
      changeProgressBarColor(memBar, memBarPercent);
      changeProgressBarColor(hddBar, hddBarPercent);
    },
  });
};

const fetchSystemClock = () => {
  $.ajax({
    url: '/api/system/clock',
    type: 'get',
    success: (data) => {
      const { time, date } = data;
      $('#mtTime').text(time);
      $('#mtDate').text(date);
    },
  });
};

const fetchSystemBoard = () => {
  $.ajax({
    url: '/api/system/routerboard',
    type: 'get',
    success: (data) => {
      const { model, 'board-name': boardName } = data;
      $('#mtModel').text(model);
      $('#mtBoard').text(boardName);

      fetchSystemHealth();
    },
  });
};

const fetchSystemHealth = () => {
  $.ajax({
    url: '/api/system/health',
    type: 'get',
    success: (data) => {
      const { temperature, voltage } = data;

      const tempBar = document.getElementById('tempBar');
      const tempBarPercent = temperature;

      $('#mtTemp').text(`${temperature}°C`);
      tempBar.style.width = `${tempBarPercent}%`;
      changeProgressBarColor(tempBar, tempBarPercent);
    },
  });
};

const fetchHotspotActive = () => {
  $.ajax({
    url: '/api/hotspot/active/count',
    type: 'get',
    success: (data) => {
      $('#mtHsActive').text(data.count);
      fetchPppActive();
    },
  });
};

const fetchPppActive = () => {
  $.ajax({
    url: '/api/ppp/active/count',
    type: 'get',
    success: (data) => {
      $('#mtPppActive').text(data.count);
    },
  });
};

const changeProgressBarColor = (element, percent) => {
  percent = Number(percent);
  if (percent == 100) {
    element.classList.remove('bg-info');
    element.classList.add('bg-danger');
  } else if (percent >= 80 && percent < 100) {
    element.classList.remove('bg-info');
    element.classList.add('bg-warning');
  }
};

const displayTrafficChart = () => {
  let labels = [];
  let downloadRateData = [];
  let uploadRateDate = [];

  const trafficChart = new Chart('trafficChart', {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          data: downloadRateData,
          backgroundColor: 'rgba(255, 99, 71, 0.1)',
          borderColor: '#d95057',
          fill: true,
          label: 'Download',
        },
        {
          data: uploadRateDate,
          backgroundColor: 'rgba(86, 145, 240, 0.2)',
          borderColor: '#5d86c9',
          fill: true,
          label: 'Upload',
        },
      ],
    },
    options: {
      responsive: true,
      tension: 0.4,
      scales: {
        x: {
          display: true,
          title: {
            display: false,
            text: 'Time',
          },
        },
        y: {
          display: true,
          title: {
            display: false,
            text: 'Rate (Mbps)',
          },
          ticks: {
            callback: (value) => {
              return value + ' Mbps';
            },
          },
        },
      },
    },
  });

  // fetch interface data every 5 seconds
  setInterval(() => {
    $.ajax({
      url: '/api/interfaces?interface=ether-ISP2',
      type: 'get',
      success: (response) => {
        let {
          'rx-bits-per-second': rxBitsPerSecond,
          'tx-bits-per-second': txBitsPerSecond,
        } = response;

        // Convert bits to Megabits (Mbps)
        const downloadMbps = (Number(rxBitsPerSecond) / 1000000).toFixed(2);
        const uploadMbps = (Number(txBitsPerSecond) / 1000000).toFixed(2);

        const timeNow = new Date().toLocaleTimeString();

        if (downloadRateData.length == 10) {
          downloadRateData.shift();
          uploadRateDate.shift();
          labels.shift();
        }

        downloadRateData.push(downloadMbps);
        uploadRateDate.push(uploadMbps);
        labels.push(timeNow);

        trafficChart.update();
      },
    });
  }, 5000);
};

const displayHsLogs = () => {
  $.ajax({
    url: '/api/system/logs/hotspot',
    success: (response) => {
      const logs = response.logs;
      const limit = 10;
      const hsBody = document.getElementById('hsLogs');

      hsBody.innerHTML = '';

      for (let x = 0; x < limit; x++) {
        hsBody.innerHTML +=
          '<tr><td>' +
          logs[x].time +
          '</td><td>' +
          logs[x].message.split('->: ')[1] +
          '</tr>';
      }
    },
  });
};

const displayPppLogs = () => {
  $.ajax({
    url: '/api/system/logs/pppoe',
    success: (response) => {
      const logs = response.logs;
      const limit = 10;
      const hsBody = document.getElementById('pppLogs');

      hsBody.innerHTML = '';

      for (let x = 0; x < limit; x++) {
        hsBody.innerHTML +=
          '<tr><td>' +
          logs[x].time +
          '</td><td>' +
          logs[x].message.split('->: ')[1] +
          '</tr>';
      }
    },
  });
};

$(() => {
  fetchSystemResource();
  fetchSystemClock();
  fetchHotspotActive();
  displayTrafficChart();
  displayHsLogs();
  displayPppLogs();

  // Intervals
  setInterval(displayHsLogs, 10000);
  setInterval(displayPppLogs, 10000);
});
