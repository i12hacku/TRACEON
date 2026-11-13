import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { IPLocationData, MapStyleId } from '../types/ip';
import { cyberSound } from '../services/soundService';
import { Pane, maskIP } from './Pane';

interface CyberMapProps {
  currentData: IPLocationData | null;
  visitorData: IPLocationData | null;
  maskedIP: boolean;
  onCoordinatesClick?: () => void;
}

export const CyberMap: React.FC<CyberMapProps> = ({
  currentData,
  visitorData,
  maskedIP,
  onCoordinatesClick
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const visitorMarkerRef = useRef<maplibregl.Marker | null>(null);

  const [mapStyle, setMapStyle] = useState<MapStyleId>('phosphor');
  const [showRadar, setShowRadar] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [currentZoom, setCurrentZoom] = useState<number>(12);
  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  const [clarityBoost, setClarityBoost] = useState<boolean>(false);
  const [isGlobe, setIsGlobe] = useState<boolean>(false);

  // Initialize MapLibre GL Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialLat = currentData?.latitude || 20;
    const initialLng = currentData?.longitude || 0;
    const initialZoom = currentData ? 12 : 2.5;

    // Dark Cyberpunk MapLibre Vector/Raster Tile Specification
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        name: 'Dark Cyberpunk Matrix',
        sources: {
          'cyber-tiles': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: '&copy; Esri &copy; OpenStreetMap'
          },
          'cyber-labels': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256
          }
        },
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: {
              'background-color': '#000000'
            }
          },
          {
            id: 'cyber-base-layer',
            type: 'raster',
            source: 'cyber-tiles',
            paint: {
              'raster-opacity': 1.0,
              'raster-contrast': 0.05,
              'raster-brightness-min': 0.1,
              'raster-brightness-max': 1.0
            }
          },
          {
            id: 'cyber-labels-layer',
            type: 'raster',
            source: 'cyber-labels',
            paint: {
              'raster-opacity': 1.0,
              'raster-contrast': 0.15
            }
          }
        ]
      },
      center: [initialLng, initialLat],
      zoom: initialZoom,
      pitch: 32, // 3D Perspective tilt
      bearing: 0,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    map.on('zoom', () => {
      setCurrentZoom(Math.round(map.getZoom() * 10) / 10);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update MapLibre canvas CSS class when mapStyle changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const container = map.getContainer();
    if (!container) return;

    container.classList.remove('tint-phosphor', 'tint-amber', 'tint-mono', 'tint-raw');
    container.classList.add(`tint-${mapStyle}`);
  }, [mapStyle]);

  // Update target marker & fly to location
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !currentData) return;

    const { latitude, longitude, ip, city, country, isLookup } = currentData;
    const displayIP = maskedIP ? maskIP(ip) : ip;

    // Remove old target marker
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    // Build Cyber Beacon HTML Element
    const markerEl = document.createElement('div');
    markerEl.className = 'beacon';
    markerEl.innerHTML = '<div class="beacon-ring"></div><div class="beacon-core"></div>';

    const popupHtml = `
      <div style="color:#5dff6e">${isLookup ? 'target' : 'you'}</div>
      <div style="color:#5dff6e;font-size:14px">${displayIP}</div>
      <div>${city}, ${country}</div>
      <div style="color:#55b765">${latitude.toFixed(4)}, ${longitude.toFixed(4)}</div>
    `;

    const popup = new maplibregl.Popup({
      offset: [0, -24],
      closeButton: true,
      closeOnClick: false,
      className: 'term-popup'
    }).setHTML(popupHtml);

    // MapLibre uses [lng, lat]
    const marker = new maplibregl.Marker({ element: markerEl, anchor: 'center' })
      .setLngLat([longitude, latitude])
      .setPopup(popup)
      .addTo(map);

    markerRef.current = marker;

    // Smooth cyber camera flyTo in MapLibre
    map.flyTo({
      center: [longitude, latitude],
      zoom: 12,
      pitch: is3DMode ? 35 : 0,
      bearing: 0,
      duration: 1700,
      essential: true
    });

    cyberSound.playLockOn();

    // Route line logic when map style is loaded
    const updateRoute = () => {
      // Remove previous route layers and source if present
      if (map.getLayer('route-core')) map.removeLayer('route-core');
      if (map.getLayer('route-glow')) map.removeLayer('route-glow');
      if (map.getSource('route-line')) map.removeSource('route-line');

      if (
        isLookup &&
        visitorData &&
        (visitorData.latitude !== latitude || visitorData.longitude !== longitude)
      ) {
        // Add GeoJSON line source
        map.addSource('route-line', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [visitorData.longitude, visitorData.latitude],
                [longitude, latitude]
              ]
            }
          }
        });

        // Add glowing neon vector route layers
        map.addLayer({
          id: 'route-glow',
          type: 'line',
          source: 'route-line',
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': '#ffb547',
            'line-width': 5,
            'line-blur': 4,
            'line-opacity': 0.35
          }
        });

        map.addLayer({
          id: 'route-core',
          type: 'line',
          source: 'route-line',
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': '#ffb547',
            'line-width': 1.5,
            'line-dasharray': [3, 2]
          }
        });

        // Add visitor marker if not already present
        if (!visitorMarkerRef.current) {
          const vEl = document.createElement('div');
          vEl.className = 'beacon beacon-origin';
          vEl.innerHTML = '<div class="beacon-core"></div>';
          const vPopup = new maplibregl.Popup({ offset: [0, -12] }).setHTML(
            `<div style="color:#ffb547">you</div><div>${visitorData.city}, ${visitorData.country}</div>`
          );
          visitorMarkerRef.current = new maplibregl.Marker({ element: vEl })
            .setLngLat([visitorData.longitude, visitorData.latitude])
            .setPopup(vPopup)
            .addTo(map);
        }
      }
    };

    if (map.isStyleLoaded()) {
      updateRoute();
    } else {
      map.once('load', updateRoute);
    }
  }, [currentData, maskedIP, is3DMode]);

  const handleZoomIn = () => {
    cyberSound.playClick();
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    cyberSound.playClick();
    mapInstanceRef.current?.zoomOut();
  };

  const handleRecenter = () => {
    if (!currentData || !mapInstanceRef.current) return;
    cyberSound.playLockOn();
    mapInstanceRef.current.flyTo({
      center: [currentData.longitude, currentData.latitude],
      zoom: 12,
      pitch: is3DMode ? 35 : 0,
      duration: 1200
    });
  };

  const toggle3DMode = () => {
    cyberSound.playClick();
    const next3D = !is3DMode;
    setIs3DMode(next3D);
    mapInstanceRef.current?.easeTo({
      pitch: next3D ? 45 : 0,
      duration: 600
    });
  };

  const toggleGlobeMode = () => {
    cyberSound.playClick();
    const next = !isGlobe;
    setIsGlobe(next);
    if (mapInstanceRef.current && (mapInstanceRef.current as any).setProjection) {
      try {
        (mapInstanceRef.current as any).setProjection({ type: next ? 'globe' : 'mercator' });
      } catch (e) {
        console.warn('Globe projection toggle error:', e);
      }
    }
  };

  const toggleFullscreen = () => {
    cyberSound.playClick();
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      mapInstanceRef.current?.resize();
    }, 200);
  };

  const click = (fn: () => void) => () => {
    cyberSound.playClick();
    fn();
  };

  const coords = currentData
    ? `${currentData.latitude.toFixed(4)},${currentData.longitude.toFixed(4)}`
    : '0,0';

  return (
    <Pane
      cmd={`geoip --map ${coords}`}
      className={`map-pane span-2 ${isFullscreen ? 'is-full' : ''}`}
      actions={
        <>
          <span className="seg" role="group" aria-label="Map tint">
            {(['phosphor', 'amber', 'mono', 'raw'] as MapStyleId[]).map((id) => (
              <button key={id} type="button" aria-pressed={mapStyle === id} onClick={click(() => setMapStyle(id))}>
                {id}
              </button>
            ))}
          </span>
          <button type="button" className="btn" aria-pressed={clarityBoost} onClick={click(() => setClarityBoost(!clarityBoost))} title="Brighten tiles">
            bright
          </button>
          <button type="button" className="btn" aria-pressed={is3DMode} onClick={toggle3DMode} title="Tilt the camera">
            tilt
          </button>
          <button type="button" className="btn" aria-pressed={isGlobe} onClick={toggleGlobeMode} title="Globe or flat projection">
            globe
          </button>
          <button type="button" className="btn" aria-pressed={showRadar} onClick={click(() => setShowRadar(!showRadar))} title="Radar sweep">
            sweep
          </button>
          <button type="button" className="btn" onClick={handleRecenter} title="Re-center on the IP">
            center
          </button>
          <button type="button" className="btn" onClick={handleZoomIn} aria-label="Zoom in">
            +
          </button>
          <button type="button" className="btn" onClick={handleZoomOut} aria-label="Zoom out">
            -
          </button>
          <button type="button" className="btn" aria-pressed={isFullscreen} onClick={toggleFullscreen}>
            {isFullscreen ? 'exit full' : 'full'}
          </button>
        </>
      }
    >
      <div className="map-frame">
        <div ref={mapContainerRef} className={`map-canvas tint-phosphor ${clarityBoost ? 'map-bright' : ''}`} />

        {showRadar && <div className="sweep" />}

        <svg className="map-reticle" width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
          <line x1="20" y1="0" x2="20" y2="12" stroke="#5dff6e" strokeWidth="1" />
          <line x1="20" y1="28" x2="20" y2="40" stroke="#5dff6e" strokeWidth="1" />
          <line x1="0" y1="20" x2="12" y2="20" stroke="#5dff6e" strokeWidth="1" />
          <line x1="28" y1="20" x2="40" y2="20" stroke="#5dff6e" strokeWidth="1" />
        </svg>

        <div
          className="map-readout"
          onClick={onCoordinatesClick}
          role={onCoordinatesClick ? 'button' : undefined}
        >
          <span className="t-hi">
            {currentData ? `${currentData.city}, ${currentData.countryCode}` : 'locating…'}
          </span>
          <span>
            {currentData
              ? `${Math.abs(currentData.latitude).toFixed(5)}°${currentData.latitude >= 0 ? 'N' : 'S'} ${Math.abs(currentData.longitude).toFixed(5)}°${currentData.longitude >= 0 ? 'E' : 'W'}`
              : '--'}
          </span>
          <span className="t-mute">z{currentZoom}</span>
        </div>
      </div>

      <div className="map-legend">
        <span>
          <span className="swatch" style={{ background: 'var(--ph)' }} />
          {currentData?.isLookup ? 'target' : 'you'}
        </span>
        {visitorData && currentData?.isLookup && (
          <span>
            <span className="swatch" style={{ background: 'var(--amber)' }} />
            you, with the line to the target
          </span>
        )}
        <span>tiles: Esri, OpenStreetMap. City-level accuracy at best.</span>
      </div>
    </Pane>
  );
};
