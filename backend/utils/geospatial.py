import math

# Municipal stations across Tamil Nadu - Chennai, Madurai & Karur districts
STATIONS = [
    # Chennai District
    {"name": "Chennai Central Control Room, Park Town", "lat": 13.0827, "lng": 80.2707, "district": "Chennai"},
    {"name": "Chennai North Zone Corporation, Tondiarpet", "lat": 13.1270, "lng": 80.2900, "district": "Chennai"},
    {"name": "Chennai South Zone Corporation, Adyar", "lat": 13.0012, "lng": 80.2565, "district": "Chennai"},
    {"name": "Chennai West Zone Public Works, Ashok Nagar", "lat": 13.0350, "lng": 80.2100, "district": "Chennai"},
    # Madurai District
    {"name": "Madurai Central Dispatch, Anna Nagar", "lat": 9.9252, "lng": 78.1198, "district": "Madurai"},
    {"name": "Madurai North Zone Corporation, Arappalayam", "lat": 9.9600, "lng": 78.1100, "district": "Madurai"},
    {"name": "Madurai South Zone Sanitation Hub, Kappalur", "lat": 9.8700, "lng": 78.0900, "district": "Madurai"},
    {"name": "Madurai Emergency Services, Goripalayam", "lat": 9.9100, "lng": 78.1300, "district": "Madurai"},
    # Karur District
    {"name": "Karur Central Control Room, Karur Town", "lat": 10.9601, "lng": 78.0766, "district": "Karur"},
    {"name": "Karur North Zone Office, Kulithalai", "lat": 10.9344, "lng": 78.4173, "district": "Karur"},
    {"name": "Karur South Zone Public Works, Aravakurichi", "lat": 10.7833, "lng": 77.9833, "district": "Karur"},
]

def get_nearest_station(user_lat: float, user_lng: float):
    if user_lat == 0.0 and user_lng == 0.0:
        return "Unknown Station (No GPS Data)"

    def haversine(lat1, lon1, lat2, lon2):
        R = 6371.0
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    nearest_station = None
    min_dist = float('inf')

    for station in STATIONS:
        dist = haversine(user_lat, user_lng, station['lat'], station['lng'])
        if dist < min_dist:
            min_dist = dist
            nearest_station = station['name']

    return f"{nearest_station} ({min_dist:.1f} km away)"
