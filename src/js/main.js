import numeral from "numeral";
import populations from "./population.json";
import { getData } from "./api";

const totalNum = (data, field) => data.reduce((sum, d) => sum + d[field], 0);

const totalRate = (data, field) => {
  const total = data.reduce((sum, d) => sum + d[field], 0);
  const totalPopulation = data.reduce((sum, d) => sum + d.population, 0);
  return total/totalPopulation;
}

(async () => {
  const table = $("#data-table");
  const rawData = await getData();
  const tableData = rawData.filter((data) => data.Country_Region !== "Others").map((data) => {
    const population = populations[data.Country_Region];
    return {
      region: data.Country_Region,
      population,
      confirmed: data.Confirmed,
      confirmedRate: population ? data.Confirmed/population : 0,
      death: data.Deaths,
      deathRate: data.Deaths/data.Confirmed,
      recovered: data.Recovered,
      recoveredRate: data.Recovered/data.Confirmed,
    };
  });
  table.bootstrapTable({
    data: tableData,
    height: 800,
    columns: [{
      title: "排名", width: 50,
      formatter: (val, row, index) => index+1,
    }, {
      title: "國家/地區", field: "region", width: 300,
    }, {
      title: "人口(萬)", field: "population", width: 100, align: "right", sortable: true,
      formatter: (val) => val ? numeral(val/10000).format("0,0") : "---",
    }, {
      title: "感染人數", field: "confirmed", width: 100, align: "right", sortable: true,
      formatter: (val) => numeral(val).format("0,0"),
    }, {
      title: "感染率(每萬)", field: "confirmedRate", width: 100, align: "right", sortable: true,
      formatter: (val, row) => row.population ? numeral(val*10000).format("0,0.000") : "---",
    }, {
      title: "死亡人數", field: "death", width: 100, align: "right", sortable: true, 
      formatter: (val) => numeral(val).format("0,0"),
    }, {
      title: "死亡率", field: "deathRate", width: 100, align: "right", sortable: true,
      formatter: (val) => numeral(val).format("0.000%"),
    }, {
      title: "康復人數", field: "recovered", width: 100, align: "right", sortable: true,
      formatter: (val) => numeral(val).format("0,0"),
    }, {
      title: "康復率", field: "recoveredRate", width: 100, align: "right", sortable: true,
      formatter: (val) => numeral(val).format("0.000%"),
    }],
  });
})();
