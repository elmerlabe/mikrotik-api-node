// convert array data to JSON
const toJsonKeyValue = (arr) => {
  let arrObj = [];

  arr.forEach((element) => {
    let json = '';
    json = '{';

    for (let x = 0; x < element.length; x++) {
      const key = element[x].field;
      const value = element[x].value;

      json += '"' + [key] + '":';
      json += '"' + value + '"';

      if (x < element.length - 1) {
        json += ',';
      }
    }

    json += '}';
    arrObj.push(JSON.parse(json));
  });

  return arrObj;
};

const testing = () => {};

module.exports = { toJsonKeyValue };
