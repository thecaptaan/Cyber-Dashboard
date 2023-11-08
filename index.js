// an anonymous function to fetch data
let fetchAttackData = async () => {
  let response = await fetch("Demo_Data.csv");
  let data = await response.text();
  let results = Papa.parse(data, {
    header: true,
    dynamicTyping: true,
    complete: function (results) {
      return results.data;
    },
  });
  return results.data;
};

// Function Create All Chart
function createChart(chartID, chartType, chartLabel, wholeLabel, chartData) {
  let ctx = document.getElementById(chartID).getContext("2d");
  let chart = new Chart(ctx, {
    type: chartType,
    data: {
      labels: chartLabel,
      datasets: [
        {
          label: wholeLabel,
          data: chartData,
          backgroundColor: "#4E9F3D",
          borderColor: "#408133",
        },
      ],
    },
  });
  return chart;
}

// fetching data and providing to all function
fetchAttackData()
  // if response is successful
  .then((data) => {
    // Total length of data
    const totalAttack = document.getElementById("totalAttack");
    totalAttack.innerHTML = data.length;

    // Total number of monitored ransomware groups
    const groupMonitored = document.getElementById("groupMonitored");
    let rasomGroup = data.map((item) => item["RANSOM GANG"]);
    let uniqueRasomGroup = [...new Set(rasomGroup)];
    groupMonitored.innerHTML = uniqueRasomGroup.length;

    //
    ransomTopGang(data);
    wordCount(data);
    lastAndCurrent(data);
    //
    perviousYearCountryChart(data, "", "France");
    document.getElementById("countrySelect").addEventListener("change", (e) => {
      console.log(e.target.value);
      perviousYearCountryChart(data, "destroy", e.target.value);
    });

    //
    createAllCountryChart(data, "", 0);
    document.getElementById("timeframe").addEventListener("change", (e) => {
      console.log("looking");
      createAllCountryChart(data, "destroy", e.target.value);
    });

    document.getElementById("searchBtn").addEventListener("click", (e) => {
      let search = document.getElementById("search");
      if (search.value === "") {
        alert("Enter something to search....");
      } else {
        searchFunction(data, search.value);
      }
    });
  })
  .catch((err) => {
    alert("Error in data fetching");
    console.log(err);
  });

// TOP 5 ransom gang
function ransomTopGang(data) {
  const ransomGroupCounts = {};
  data.forEach((item) => {
    const ransomGroup = item["RANSOM GANG"];
    if (ransomGroup in ransomGroupCounts) {
      ransomGroupCounts[ransomGroup] += 1;
    } else {
      ransomGroupCounts[ransomGroup] = 1;
    }
  });

  const topRansomGroups = Object.entries(ransomGroupCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
  const label = Object.keys(topRansomGroups);
  const values = Object.values(topRansomGroups);
  const chartLabel = "Top Ransom Gang";
  createChart("topRansomGang", "bar", label, chartLabel, values);
}

function countryWiseData(data, selectCountry) {
  // Create the country select
  let countrySelect = document.getElementById("countrySelect");
  let country = data.map((item) => item["COUNTRY"]);
  let uniqueCountry = [...new Set(country)];
  uniqueCountry.forEach((item) => {
    if (item === "null" || item === undefined) {
      return;
    }
    let option = document.createElement("option");
    option.value = item;
    option.innerHTML = item;
    countrySelect.appendChild(option);
  });

  const previousData = {};

  const currentDate = moment();
  const startDate = moment(currentDate).subtract(12, "months");

  for (let i = 1; i <= 12; i++) {
    const currentMonth = moment(startDate).add(i, "months").format("MMM");
    previousData[currentMonth] = 0;
  }
  data.forEach((attack) => {
    if (selectCountry == attack.COUNTRY) {
      const attackDate = moment(attack.DATE, "DD/MM/YYYY");
      const monthYear = attackDate.format("MMM");
      if (previousData.hasOwnProperty(monthYear)) {
        previousData[monthYear]++;
      }
    }
  });
  return previousData;
}

let countryPerviousChart;
function perviousYearCountryChart(data, option, Country) {
  const result = countryWiseData(data, Country);
  const label = Object.keys(result);
  const values = Object.values(result);
  let chartLabel = `One Year Attacks On ${Country}`;
  if (option === "destroy") {
    countryPerviousChart.destroy();
  }
  countryPerviousChart = createChart(
    "countrySpecific",
    "bar",
    label,
    chartLabel,
    values
  );
}

// Total Attack on country

function allCountryData(data, timeFrame) {
  const countryCounts = {};
  let now = moment();
  let FilteredData = data.filter((item) => {
    if (item.COUNTRY !== undefined && item.COUNTRY !== null) {
      if (
        moment(item.DATE, "DD/MM/YYYY") >
        moment(now, "DD/MM/YYYY").subtract(timeFrame, "day")
      ) {
        return item;
      }
      if (parseInt(timeFrame) === 0) {
        return item;
      }
    } else {
      return;
    }
  });
  FilteredData.forEach((attack) => {
    const country = attack.COUNTRY;
    if (countryCounts[country]) {
      countryCounts[country] += 1;
    } else {
      countryCounts[country] = 1;
    }
  });
  return countryCounts;
}

let allCountryChart;
function createAllCountryChart(data, option, timeFrame = 0) {
  const result = allCountryData(data, timeFrame);
  const labels = Object.keys(result);
  const values = Object.values(result);
  console.log(result);
  const DataLabel = `Time Wise Attack On Country`;
  if (option === "destroy") {
    allCountryChart.destroy();
  }
  allCountryChart = createChart(
    "timeFrameCountry",
    "bar",
    labels,
    DataLabel,
    values
  );
}

// Word Count

function wordCount(data) {
  const ransomGroupCounts = {};
  data.forEach((item) => {
    const ransomGroup = item["RANSOM GANG"];
    if (ransomGroup in ransomGroupCounts) {
      ransomGroupCounts[ransomGroup] += 1;
    } else {
      if (ransomGroup !== undefined && ransomGroup !== null) {
        ransomGroupCounts[ransomGroup] = 1;
      }
    }
  });

  const resultArray = Object.entries(ransomGroupCounts).map(([key, value]) => ({
    key,
    value,
  }));

  console.log(resultArray);
  new Chart(document.getElementById("wordCount").getContext("2d"), {
    type: "wordCloud",
    data: {
      labels: resultArray.map((d) => d.key),
      datasets: [
        {
          label: "",
          data: resultArray.map((d) => 10 + d.value),
        },
      ],
    },
    options: {
      title: {
        display: false,
        text: "Attacker Word JS",
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
}

function lastAndCurrent(data) {
  const currentMonthSpanId = document.getElementById("currentMonthSpan");
  const currentYearSpanId = document.getElementById("currentYearSpan");
  currentMonthSpanId.innerText = moment().format("MMMM");
  currentYearSpanId.innerText = moment().format("YYYY");
  let lastHour = document.getElementById("lastHour");
  let currentMonthId = document.getElementById("currentMonth");
  let last90DaysId = document.getElementById("last90Days");
  let currentYear = document.getElementById("currentYear");

  const last24Hours = data.filter((item) => {
    const itemDate = moment(item.DATE, "DD/MM/YYYY");
    return itemDate.isAfter(moment().subtract(1, "days"));
  }).length;

  const last90Days = data.filter((item) => {
    const itemDate = moment(item.DATE, "DD/MM/YYYY");
    return itemDate.isAfter(moment().subtract(90, "days"));
  }).length;

  const currentMonth = data.filter((item) => {
    const itemDate = moment(item.DATE, "DD/MM/YYYY");
    return itemDate.isSame(moment(), "month");
  }).length;

  const thisYear = data.filter((item) => {
    const itemDate = moment(item.DATE, "DD/MM/YYYY");
    return itemDate.isSame(moment(), "year");
  }).length;

  lastHour.innerText = last24Hours;
  last90DaysId.innerText = last90Days;
  currentMonthId.innerText = currentMonth;
  currentYear.innerText = thisYear;
  console.log(thisYear);
}

function searchFunction(data, value) {
  let currentPage = 0;
  const resultsPerPage = 10;
  const searchInData = (searchTerm) => {
    const results = [];
    data.forEach((item) => {
      Object.values(item).forEach((value) => {
        if (
          typeof value === "string" &&
          value.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          results.push(item);
        }
      });
    });
    return results;
  };
  let html = `<div class="resultTableContainer">
  <div class="table-header">
   <h2>Search Result</h2>
  </div>
   <table class="resultTable">
       <thead>
           <th>No</th>
           <th>Date</th>
           <th>Victim</th>
           <th>Ransom Gang</th>
           <th>Country</th>
       </thead>
       <tbody id="resultTableBody">
           
       </tbody>
   </table>
   <button id="resultPrev">Prev</button>
   <button id="resultNext">Next</button>
</div>`;
  let infoHtml = document.getElementById("insertSearchResult");
  infoHtml.innerHTML =  html
  const searchTerm = value;
  const searchResults = searchInData(searchTerm);
  let slicedResultLength;
  const renderResults = (results) => {
    const startIndex = currentPage * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    const slicedResults = results.slice(startIndex, endIndex);
    slicedResultLength = slicedResults.length;
    const tableBody = document.getElementById("resultTableBody");
    tableBody.innerHTML = "";

    slicedResults.forEach((item) => {
      const { No, DATE, VICTIM, "RANSOM GANG": ransomGang, COUNTRY } = item;
      const row = tableBody.insertRow();
      row.insertCell().appendChild(document.createTextNode(No));
      row.insertCell().appendChild(document.createTextNode(DATE));
      row.insertCell().appendChild(document.createTextNode(VICTIM));
      row.insertCell().appendChild(document.createTextNode(ransomGang));
      row.insertCell().appendChild(document.createTextNode(COUNTRY));
    });
  };
  renderResults(searchResults);
  let resultNext = document.getElementById("resultNext");
  let resultPrev = document.getElementById("resultPrev");
  resultNext.addEventListener("click", () => {
    if (slicedResultLength < 10) {
      return;
    } else {
      currentPage++;
      renderResults(searchResults);
    }
  });
  resultPrev.addEventListener("click", () => {
    if (currentPage === 1) {
      return;
    } else {
      currentPage--;
      renderResults(searchResults);
    }
  });
}
