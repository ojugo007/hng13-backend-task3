# 🌍 Country Data API

## 🏗️ Overview
This project is a **Node.js + Express REST API** that manages a database of countries.  
It integrates with the [REST Countries API](https://restcountries.com/) and [Exchange Rate API](https://open.er-api.com/) to:
- Refresh country data (name, capital, region, population, currency, exchange rate, GDP estimate)
- Allow filtering, sorting, and retrieval of country data
- Generate an image summary of the top 5 countries by GDP
- Track the last refresh timestamp
- Support CRUD operations for individual countries

---

## ⚙️ Tech Stack
- **Node.js** + **Express.js**
- **MySQL** (Aiven Cloud)
- **Axios**
- **Canvas**
- **dotenv**

---

## 📦 Installation

```bash
git clone <your_repo_url>
cd <project_name>
npm install
touch .env
```

### `.env` Example
```env
MYSQL_HOST=<your_aiven_mysql_host>
MYSQL_USER=<your_user>
MYSQL_PWD=<your_password>
MYSQL_DB=countrydb
MYSQL_PORT=19041
```

---

## 🚀 Running the Server
```bash
npm start
```
Visit: `http://localhost:3000`

---

## 📚 API Endpoints

### 🔄 POST /countries/refresh
Fetches data from external APIs and refreshes the database.

**Response 200**
```json
{ "message": "Countries refreshed successfully and summary image generated." }
```

---

### 🌍 GET /countries
Retrieve all countries with optional filters and sorting.

**Query Parameters:**
| Name | Description | Example |
|------|--------------|----------|
| region | Filter by region | ?region=Africa |
| currency | Filter by currency | ?currency=NGN |
| sort | Sorting option | ?sort=gdp_desc |

**Response 200**
```json
[ { "name": "Nigeria", "region": "Africa", "currency_code": "NGN" } ]
```

---

### 🧭 GET /countries/:name
Retrieve a country by name.

**Response 200**
```json
[ { "name": "Nigeria", "capital": "Abuja" } ]
```

---

### ✏️ PUT /countries/:name
Update or insert a country if not found.

**Request Body Example**
```json
{ "capital": "Lagos", "population": 210000000 }
```

**Response 200**
```json
{ "message": "Updated 'Nigeria' successfully" }
```

---

### 🗑️ DELETE /countries/:name
Deletes a country.

**Response 200**
```json
{ "message": "successfully deleted country" }
```

---

### 📊 GET /countries/status
Returns system statistics.

**Response 200**
```json
{ "total_countries": 250, "last_updated_at": "2025-10-28T18:40:00.000Z" }
```

---

### 🖼️ GET /countries/image
Serves the summary image (`cache/summary.png`).

**Response 404**
```json
{ "error": "Summary image not found" }
```

---

## 🧪 Test Cases

| Endpoint | Method | Input | Expected Output |
|-----------|--------|--------|----------------|
| /countries/refresh | POST | None | Message + image generated |
| /countries | GET | ?region=Africa | African countries |
| /countries | GET | ?sort=gdp_desc | Sorted by GDP |
| /countries/Nigeria | GET | — | Nigeria info |
| /countries/Kenya | PUT | body | Insert/Update Kenya |
| /countries/Nigeria | DELETE | — | Delete Nigeria |
| /countries/status | GET | — | Stats |
| /countries/image | GET | — | PNG Image |

---

## 🧱 Database Schema

| Column | Type | Description |
|---------|------|-------------|
| id | INT | Primary Key |
| name | VARCHAR(100) | Country name |
| capital | VARCHAR(100) | Capital city |
| region | VARCHAR(100) | Region |
| population | BIGINT | Population |
| currency_code | VARCHAR(3) | Currency code |
| exchange_rate | DECIMAL | Exchange rate |
| estimated_gdp | DECIMAL | GDP estimate |
| flag_url | VARCHAR(255) | Flag URL |
| last_refreshed_at | TIMESTAMP | Updated timestamp |

---

## 🧠 Utilities

### `getGdpEstimate(population, rate)`
Calculates GDP using:
```
GDP = population * rate * randomMultiplier(1000–2000)
```

### `generateSummaryImage(total, top5, lastRefreshed)`
Uses Canvas to create `cache/summary.png`.

---

## 🔐 Middleware
Ensures `/:name` params are valid strings (letters/spaces only).

---

## 🧾 License
MIT © 2025 Your Name
