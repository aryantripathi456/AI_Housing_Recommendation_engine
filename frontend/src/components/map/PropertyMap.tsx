import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import type { Property } from '../../types/property';
import { formatK, formatPropertyPrice, formatSaleINR } from '../../utils/recommendation';

interface Props {
  properties: Property[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
}

function markerLabel(p: Property): string {
  if (p.listingType === 'sale') return formatSaleINR(p.price).replace('₹', '₹');
  return formatK(p.price);
}

function priceIcon(p: Property, selected: boolean) {
  return L.divIcon({
    className: 'nestai-marker',
    html: `<div style="position:relative"><span class="price-pill${selected ? ' selected' : ''}">${markerLabel(p)}</span></div>`,
    iconSize: [70, 34],
    iconAnchor: [35, 34],
    popupAnchor: [0, -30],
  });
}

function FlyToSelected({ properties, selectedId }: { properties: Property[]; selectedId: string | null }) {
  const map = useMap();
  useEffect(() => {
    const p = properties.find((x) => x.id === selectedId);
    if (p) map.flyTo([p.latitude, p.longitude], Math.max(map.getZoom(), 13), { duration: 0.8 });
  }, [selectedId, properties, map]);
  return null;
}

function LocateButton() {
  const map = useMap();
  return (
    <button
      type="button"
      aria-label="Locate me"
      title="Locate me"
      onClick={(e) => {
        e.stopPropagation();
        if (!navigator.geolocation) {
          map.flyTo([19.076, 72.8777], 12);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => map.flyTo([pos.coords.latitude, pos.coords.longitude], 14, { duration: 1 }),
          () => map.flyTo([19.076, 72.8777], 12),
        );
      }}
      className="absolute bottom-6 right-3 z-[1000] grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-navy-900 shadow-lg transition hover:bg-slate-50"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
        <circle cx="12" cy="12" r="8" />
      </svg>
    </button>
  );
}

export default function PropertyMap({ properties, selectedId, onSelect, onOpen }: Props) {
  const center: [number, number] =
    properties.length > 0
      ? [properties[0].latitude, properties[0].longitude]
      : [19.076, 72.8777];

  return (
    <div className="relative h-[380px] md:h-[520px] w-full overflow-hidden rounded-[20px] border border-slate-200 shadow-xl">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        className="h-full w-full"
        aria-label="Map of property listings"
      >
        {/*
          Keyless OSM standard tiles (no API key required).
          Replaced legacy CARTO basemaps.cartocdn.com endpoint, which began
          serving key-demand overlays. OSM Tile Usage Policy: keep the
          attribution below exact; demo-scale traffic only.
          Future fallback (also keyless): Esri WorldStreetMap
          https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}
        */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <FlyToSelected properties={properties} selectedId={selectedId} />
        <LocateButton />
        {properties.map((p) => (
          <Marker
            key={p.id}
            position={[p.latitude, p.longitude]}
            icon={priceIcon(p, p.id === selectedId)}
            eventHandlers={{ click: () => onSelect(p.id) }}
          >
            <Popup>
              <div className="overflow-hidden">
                <img src={p.image} alt={p.title} className="h-28 w-full object-cover" loading="lazy" />
                <div className="p-3">
                  <p className="text-[13px] font-extrabold text-navy-900">{p.title}</p>
                  <p className="text-[12px] text-slate-500">{p.location}</p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <p className="text-[14px] font-extrabold text-navy-900">
                      {formatPropertyPrice(p.price, p.listingType)}<span className="font-medium text-slate-400">{p.listingType === 'sale' ? '' : '/mo'}</span>
                    </p>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                      {p.matchScore}% AI Match
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpen(p.id)}
                    className="mt-2.5 h-9 w-full rounded-xl bg-navy-900 text-[13px] font-semibold text-white hover:bg-emerald-600"
                  >
                    View details
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="absolute left-3 top-3 z-[500] rounded-full bg-navy-900/90 px-3 py-1.5 text-[12px] font-semibold text-white backdrop-blur">
        {properties.length} homes on map
      </div>
    </div>
  );
}
