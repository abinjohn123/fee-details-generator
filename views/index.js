'use strict';

const getDataEl = document.getElementById('get-data');
const FDSectionEl = document.querySelector('.fee-details');

function timedRefresh(timeoutPeriod) {
  let timer = setTimeout('location.reload(true);', timeoutPeriod);
}

// window.onload = timedRefresh(4000);
// let node = document.querySelectorAll('.card');
// node.forEach((cardEl) => {
//   domtoimage.toBlob(cardEl).then(function (blob) {
//     saveAs(blob, `${cardEl.id.split(' ').join('_')}--Fee-Details.png`);
//   });
// });
