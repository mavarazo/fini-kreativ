const fs = require("fs");
const path = require("path");

const NODE_ENV = process.env.NODE_ENV || "development";
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

let STRAPI_URL;

if (NODE_ENV === "production") {
  STRAPI_URL =
    process.env.STRAPI_PRODUCTION_URL || "https://ihre-strapi-domain.com/api";
} else {
  STRAPI_URL = "http://localhost:1337/api";
}

const DATA_DIR = path.join(__dirname, "data");
const DISABLE_PAGINATION = "pagination[limit]=-1";
const POPULATE_ALL = "populate=*";

const CONTENT_MAP = {
  clutches: `/products?filters[type][$eq]=Clutch&${DISABLE_PAGINATION}&${POPULATE_ALL}`,
  necessaires: `/products?filters[type][$eq]=Necessaire&${DISABLE_PAGINATION}&${POPULATE_ALL}`,
  sacs: `/products?filters[type][$eq]=Sac&${DISABLE_PAGINATION}&${POPULATE_ALL}`,

  about: `/about?${POPULATE_ALL}`,
  imprint: `/imprint?${POPULATE_ALL}`,
  landing: `/landing?${POPULATE_ALL}`,
  privacy: `/privacy?${POPULATE_ALL}`,
  term_condition: `/term-condition?${POPULATE_ALL}`,
};

async function fetchAndSave(key, endpointPath) {
  const fileName = key + ".json";
  const filePath = path.join(DATA_DIR, fileName);
  const fullUrl = STRAPI_URL + endpointPath;

  console.log(`➡️  Fetching "${key}" from ${fullUrl}`);

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status} for ${key}`);
    }

    const data = await response.json();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    console.log(`✅ ${fileName} saved.`);
  } catch (error) {
    console.error(`❌ ERROR fetching ${key}:`, error.message);
    process.exit(1);
  }
}

// ---------------------------------------
// 4. Hauptsynchronisationslogik
// ---------------------------------------
async function syncContent() {
  if (!STRAPI_TOKEN) {
    console.error(
      "❌ ERROR: STRAPI_API_TOKEN environment variable is not set. Cannot authenticate with Strapi.",
    );
    process.exit(1);
  }

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } else {
    fs.readdirSync(DATA_DIR).forEach((file) => {
      fs.unlinkSync(path.join(DATA_DIR, file));
    });
  }

  console.log("======================================");
  console.log(`  Starting Strapi Content Sync (${NODE_ENV}) `);
  console.log("======================================");

  // Iterieren über alle Keys in der CONTENT_MAP
  for (const key in CONTENT_MAP) {
    if (CONTENT_MAP.hasOwnProperty(key)) {
      await fetchAndSave(key, CONTENT_MAP[key]);
    }
  }

  console.log("======================================");
  console.log("  Content Sync Complete               ");
  console.log("======================================");
}

syncContent();
