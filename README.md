# IOT-PROJ3D5
IoT
# StreetLight Energy Consumption and Saving Dashboard – Backend

## Project Aim

The main aim of this project is to design and develop a **Streetlight Energy Consumption and Saving Dashboard** that monitors, analyzes, and visualizes streetlight energy usage in order to improve efficiency and reduce energy wastage.

## Specific Objectives

1. **To collect and monitor streetlight energy consumption data in real time** – ESP32 devices send voltage, current, power, and energy readings to the backend via REST API.
2. **To develop a dashboard for visualizing energy usage** – Backend provides JSON endpoints for charts, graphs, and reports (to be consumed by React frontend).
3. **To identify areas of high energy consumption and potential energy savings** – Daily energy logs store consumed kWh and calculated savings against a configurable baseline.
4. **To detect faulty or inefficient streetlights** – Automatic alerts are created when readings exceed thresholds (overvoltage, undervoltage, low power/current).
5. **To support decision-making for maintenance and energy management** – Unresolved alerts and filtered energy logs give actionable insights.
6. **To promote sustainable and cost-effective streetlight operations** – Savings tracking and consumption trends enable data-driven efficiency improvements.

## Backend Overview

This Django REST Framework (DRF) backend handles:
- Device authentication using pre‑generated tokens (one per streetlight).
- Ingestion of real‑time sensor data from ESP32 devices.
- Storage of readings, alerts, daily energy logs, and streetlight metadata.
- Automatic alert generation based on configurable thresholds.
- Daily energy aggregation (kWh consumed, saved, cost).
- REST API for dashboard (React / any frontend).

All data is stored in a **PostgreSQL** database (SQLite is used for development).

## Tech Stack

| Component       | Technology                          |
|----------------|-------------------------------------|
| Backend        | Django 6.0.5, Django REST Framework |
| Database       | PostgreSQL (development: SQLite)    |
| Authentication | Device tokens + (future: JWT for dashboard) |
| API Style      | REST                                |

## API Endpoints

Base URL: `http://<server-ip>:8000`

### Streetlights
| Method | Endpoint                            | Description                     |
|--------|-------------------------------------|---------------------------------|
| GET    | `/api/streetlights/`                | List all streetlights           |
| POST   | `/api/streetlights/`                | Create a new streetlight        |
| GET    | `/api/streetlights/<id>/`           | Retrieve a streetlight          |
| PUT    | `/api/streetlights/<id>/`           | Update a streetlight            |
| DELETE | `/api/streetlights/<id>/`           | Delete a streetlight            |

### ESP32 Data Ingestion
| Method | Endpoint                     | Description                                         |
|--------|------------------------------|-----------------------------------------------------|
| POST   | `/api/esp32/reading/`        | Send sensor reading (requires device token in JSON) |

**Request body example:**
```json
{
  "token": "your_device_token",
  "voltage": 220.5,
  "current": 0.45,
  "power": 99.2,
  "energy_wh": 12.3
}
