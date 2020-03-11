import axios from "axios";
import populations from "./population.json";

const sanitizeData = (data) => {
  const map = data.reduce((m, d) => {
    let region = d.Country_Region;
    if (d.Province_State === "Hong Kong") {
      region = "Hong Kong";
    } else if (d.Country_Region === "Taiwan*") {
      region = "Taiwan";
    } else if (d.Province_State === "Macau") {
      region = "Macau";
    }

    const obj = {
      Country_Region: region,
      Confirmed: d.Confirmed,
      Deaths: d.Deaths,
      Recovered: d.Recovered,
    };

    if (m[region]) {
      m[region].Confirmed += obj.Confirmed;
      m[region].Deaths += obj.Deaths;
      m[region].Recovered += obj.Recovered;
    } else {
      m[region] = obj;
    }

    return m;
  }, {});

  const list = Object.values(map).sort((a, b) => b.Confirmed - a.Confirmed);
  return list;
};

export const getData = async () => {
  const URL = "https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/1/query?f=json&where=Confirmed%20%3E%200&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=Confirmed%20desc%2CCountry_Region%20asc%2CProvince_State%20asc&resultOffset=0&resultRecordCount=250&cacheHint=true";
  const response = await axios({
    method: "GET",
    url: URL,
  });
  const raw = response.data.features.map((data) => data.attributes);
  const sanitized = sanitizeData(raw);
  return sanitized;
};
