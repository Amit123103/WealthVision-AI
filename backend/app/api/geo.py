from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
import httpx
import random
import asyncio
from typing import Optional

router = APIRouter()

MIRRORS = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.osm.ch/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter",
    "https://overpass-api.de/api/interpreter"
]

@router.get("/tile-proxy")
async def tile_proxy(url: str = Query(...)):
    """Proxies tile requests to bypass CORS and SSL issues."""
    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
        try:
            r = await client.get(url)
            if r.status_code == 200:
                # Stream the content to the client
                return StreamingResponse(
                    content=r.iter_bytes(),
                    media_type=r.headers.get("Content-Type", "application/octet-stream"),
                    headers={"Cache-Control": "max-age=86400"}
                )
            elif r.status_code == 404:
                # Return 204 No Content for missing tiles to keep console clean
                raise HTTPException(status_code=204)
            else:
                raise HTTPException(status_code=r.status_code)
        except Exception as e:
            # Silently fail for tiles to prevent engine crash
            raise HTTPException(status_code=204)

@router.get("/buildings")
async def get_buildings(lat: float, lng: float, radius: float = 0.035):
    off = radius / 2
    bbox = f"{lat-off},{lng-off},{lat+off},{lng+off}"
    q = f'[out:json][timeout:25];(way["building"]({bbox});relation["building"]({bbox}););out body;>;out skel qt;'
    
    # Randomize start mirror to distribute load and avoid global blocks
    mirrors_to_try = list(MIRRORS)
    random.shuffle(mirrors_to_try)
    
    last_error = "Unknown"
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        for mirror in mirrors_to_try:
            try:
                r = await client.post(
                    mirror, 
                    data={"data": q},
                    headers={"Content-Type": "application/x-www-form-urlencoded"}
                )
                if r.status_code == 200:
                    data = r.json()
                    return process_overpass_to_geojson(data)
                elif r.status_code == 429:
                    last_error = f"Rate limited by {mirror}"
                    continue
                else:
                    last_error = f"Error {r.status_code} from {mirror}"
            except Exception as e:
                last_error = f"Connection failed to {mirror}: {str(e)}"
                
    raise HTTPException(status_code=503, detail=f"All Overpass mirrors failed. Last error: {last_error}")

def process_overpass_to_geojson(data):
    nodes = {}
    for element in data.get('elements', []):
        if element['type'] == 'node':
            nodes[element['id']] = [element['lon'], element['lat']]
            
    features = []
    for element in data.get('elements', []):
        if element['type'] == 'way' and 'nodes' in element:
            coords = []
            for nid in element['nodes']:
                if nid in nodes:
                    coords.append(nodes[nid])
            
            if len(coords) < 4:
                continue
                
            # Close polygon
            if coords[0] != coords[-1]:
                coords.append(coords[0])
                
            tags = element.get('tags', {})
            height = float(tags.get('height', tags.get('building:levels', 0)))
            if not height:
                # Random realistic height fallback
                height = float(random.randint(6, 32))
            elif ':' in str(height): # if building:levels is used
                height = float(height) * 3.5
            
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [coords]
                },
                "properties": {
                    "height": height,
                    "min_height": 0,
                    "wealth_seed": random.random()
                }
            })
            
    return {"type": "FeatureCollection", "features": features}
