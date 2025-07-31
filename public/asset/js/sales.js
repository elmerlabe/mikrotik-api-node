const dateNow = new Date();
const profiles = ['3HRS', '1day', '1week', '1month'];
let salesData = [];
let paginatedData = [];
let page = 1;
let perPage = 20;
let totalPage = 0;
let totalAmount = 0;
let profile3HrsSales = 0;
let profile1DaySales = 0;
let profile1WeekSales = 0;
let profile1MonthSales = 0;

let sellerSalesByPercent = 0;
let mgwSalesByPercent = 0;

const filterData = () => {
  const prof = $('#profile').val();
  const seller = $('#seller').val().toLocaleLowerCase();
  const sellerPrefix = seller.substring(0, 1).toLocaleLowerCase();
  const search = $('#search').val().toLocaleLowerCase();
  let ttlAmount = 0;

  //filter out the data in array based on the selected profile or seller
  const filteredData = salesData.filter((item) => {
    const profile = item.profile.toLowerCase();
    const cPrefix = item.code.substring(0, 1).toLowerCase();
    const comment = item.comment.toLocaleLowerCase();
    const code = item.code.toLocaleLowerCase();

    return (
      (prof === '' || prof === profile) &&
      (sellerPrefix === '' ||
        sellerPrefix === cPrefix ||
        comment.includes(seller)) &&
      (search === '' ||
        search === profile ||
        comment.includes(search) ||
        code.includes(search))
    );
  });

  // reset profile sales value
  resetProfileSales();

  //get total amount from filtered data result
  filteredData.map((item) => {
    setSalesToProfile(item.profile, item.amount);
    ttlAmount += Number(item.amount);
  });

  totalAmount = ttlAmount;

  return filteredData;
};

const handleSearch = (e) => {
  if (e.key === 'Enter') {
    page = 1;
    const fData = filterData();
    paginateData(fData);
  }
};

const handleSelectFilter = () => {
  page = 1;
  const fData = filterData();
  paginateData(fData);
  calculateShares();
};

const handleSelectPercent = () => {
  calculateShares();
};

const handleShowPerPage = () => {
  page = 1;
  perPage = Number($('#perPage').val());
  const fData = filterData();
  paginateData(fData);
};

const displayPageData = () => {
  const len = filterData().length;
  totalPage = Math.ceil(len / perPage);
  document.getElementById('pageData').innerHTML = page;
  document.getElementById('totalPageData').innerHTML = totalPage;
  calculateShares();
};

const displaySales = () => {
  let totalSalesElement = document.getElementById('totalAmount');
  let sellerSalesElement = document.getElementById('sellerSales');
  let mgwSalesElement = document.getElementById('mgwSales');
  let sellerNameCard = document.getElementById('sellerNameCard');

  let sellerSales = '₱ 0';
  let mgwSales = '₱ 0';
  let name = 'Seller';

  if ($('#seller').val() != '') {
    sellerSales = '₱ ' + sellerSalesByPercent.toLocaleString();
    mgwSales = '₱ ' + (totalAmount - sellerSalesByPercent).toLocaleString();
    name = $('#seller').val();
  }

  // per profile sales
  $('#profile3HrsSales').html(profile3HrsSales);
  $('#profile1DaySales').html(profile1DaySales);
  $('#profile1WeekSales').html(profile1WeekSales);
  $('#profile1MonthSales').html(profile1MonthSales);

  totalSalesElement.innerHTML = totalAmount.toLocaleString();
  sellerSalesElement.innerHTML = sellerSales;
  mgwSalesElement.innerHTML = mgwSales;
  sellerNameCard.innerHTML = name;
  $('#salesTitle').html(
    name == 'Seller' ? 'Sales Report' : name + ' Sales Report'
  );
};

const prevPage = () => {
  if (page > 1) {
    page -= 1;
    const fData = filterData();
    paginateData(fData);
  }
};

const nextPage = () => {
  if (page < totalPage) {
    page += 1;
    const fData = filterData();
    paginateData(fData);
  }
};

const paginateData = (data) => {
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  paginatedData = data.slice(startIndex, endIndex);
  dispalySalesData();
  displayPageData();
};

const dispalySalesData = () => {
  const tableData = document.getElementById('tableData');
  tableData.innerHTML = '';

  //Display all the data in the table
  paginatedData.map((d, index) => {
    const { amount, code, comment, date, ip, mac, profile, time, timeLimit } =
      d;

    tableData.innerHTML +=
      "<tr><th scope='row'>" +
      (index + 1) +
      '</th>' +
      '<td>' +
      date +
      '</td>' +
      '<td>' +
      time +
      '</td>' +
      '<td>' +
      code +
      '</td>' +
      '<td>' +
      profile +
      '</td>' +
      '<td>' +
      comment +
      '</td>' +
      '<td>' +
      amount +
      '</td></tr>';
  });
};

const fetchSalesData = () => {
  const dateFrom = $('#dateFrom').val();
  const dateTo = $('#dateTo').val();
  const profile = $('#profile').val();
  const seller = $('#seller').val();
  const database = $('#database').val();
  const url = database === 'mikrotik'? '/api/hotspot/sales': `/api/hotspot/sales/${database}`;

  $.ajax({
    url: url,
    type: 'post',
    data: {
      dateFrom: dateFrom,
      dateTo: dateTo,
      profile: profile,
      seller: seller,
    },
    dataType: 'json',
    success: (data) => {
      disableViewReportBtn(false);
      disableCsvBtn(false);
      showSpinner(false);
      $('#tableSales').show();
      salesData = data;
      paginateData(data);
      displayPageData();
    },
  });
};

const disableViewReportBtn = (isShow) => {
  $('#viewBtn').prop('disabled', isShow);
};

const disableCsvBtn = (isShow) => {
  $('#csvBtn').prop('disabled', isShow);
};

const showSpinner = (isShow) => {
  isShow ? $('#tbSpinner').show() : $('#tbSpinner').hide();
};

const initDatesValue = () => {
  $('#dateFrom').val(
    dateNow.getFullYear() + '-' + addZero(dateNow.getMonth() + 1) + '-01'
  );
  $('#dateTo').val(dateTodayToString());
};

const dateTodayToString = () => {
  let d = '';
  let mon = addZero(dateNow.getMonth() + 1);
  let date = addZero(dateNow.getDate());

  return dateNow.getFullYear() + '-' + mon + '-' + date;
};

const addZero = (num) => {
  if (num < 10) {
    return '0' + num;
  }
  return num;
};

const downloadCsvData = (data) => {
  const blob = new Blob([data], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', 'report.csv');
  a.click();
};

const generateCsvData = async () => {
  let csvData = '';
  const arrayData = filterData();

  const headers = 'date,time,code,profile,comment,amount';

  csvData += headers + '\n';
  csvData += arrayData
    .map(
      (item) =>
        `${item.date},${item.time},${item.code},${item.profile},${item.comment},${item.amount}`
    )
    .join('\n');

  downloadCsvData(csvData);
};

const calculateShares = () => {
  const sharePercent = Number($('#sharePercent').val());
  sellerSalesByPercent = Math.ceil(sharePercent * totalAmount);
  displaySales();
};

const setSalesToProfile = (profile, amount) => {
  amount = Number(amount);

  switch (profile) {
    case profiles[0]: // 3HRS
      profile3HrsSales += amount;
      break;
    case profiles[1]: // 1day
      profile1DaySales += amount;
      break;
    case profiles[2]: // 1week
      profile1WeekSales += amount;
      break;
    case profiles[3]: // 1month
      profile1MonthSales += amount;
      break;
  }
};

const resetProfileSales = () => {
  profile3HrsSales = 0;
  profile1DaySales = 0;
  profile1WeekSales = 0;
  profile1MonthSales = 0;
};

// DOM interaction
$(() => {
  initDatesValue();
  $('#tableSales').hide();
  disableViewReportBtn(true);
  disableCsvBtn(true);
  fetchSalesData();

  perPage = Number($('#perPage').val());

  $('#viewBtn').on('click', () => {
    disableViewReportBtn(true);
    disableCsvBtn(true);
    $('#tableSales').hide();
    showSpinner(true);
    fetchSalesData();
  });

  $('#csvBtn').on('click', () => {
    disableCsvBtn(false);
    generateCsvData();
  });
});
