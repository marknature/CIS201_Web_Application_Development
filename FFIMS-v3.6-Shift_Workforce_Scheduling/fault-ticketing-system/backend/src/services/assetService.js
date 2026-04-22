const { ASSET_API } = require("../config/config");

const fetchAssets = async () => {
  try {
    const response = await fetch(ASSET_API);
    if (!response.ok) {
      throw new Error(`Asset API failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.data || data;
  } catch (error) {
    return [
      {
        id: "1",
        name: "HVAC Unit A1",
        category: "Mechanical",
        location: "Administration Block",
        maintenance_link: "/maintenance/work-orders/HVAC-A1"
      },
      {
        id: "2",
        name: "Laboratory Microscope B2",
        category: "Laboratory",
        location: "Science Lab 2",
        maintenance_link: "/maintenance/work-orders/MICRO-B2"
      },
      {
        id: "3",
        name: "Campus Router R7",
        category: "ICT",
        location: "Network Operations Room",
        maintenance_link: "/maintenance/work-orders/ROUTER-R7"
      }
    ];
  }
};

const assetExists = async (assetId) => {
  const assets = await fetchAssets();
  return assets.some((asset) => String(asset.id) === String(assetId));
};

module.exports = {
  fetchAssets,
  assetExists
};
