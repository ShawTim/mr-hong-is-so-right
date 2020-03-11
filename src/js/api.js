import axios from "axios";

export const getData = async () => {
  const URL = "https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/2/query?f=json&where=Confirmed%20%3E%200&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=Confirmed%20desc&resultOffset=0&resultRecordCount=200&cacheHint=true";
  const response = await axios({
    method: "GET",
    url: URL,
  });
  return response.data.features.map((data) => data.attributes);
};
