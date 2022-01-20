'use strict';

const getDataEl = document.querySelectorAll('.btn-download-fd');
const FDSectionEl = document.querySelector('.fee-details');

function timedRefresh(timeoutPeriod) {
  let timer = setTimeout('location.reload(true);', timeoutPeriod);
}

// window.onload = timedRefresh(4000);
