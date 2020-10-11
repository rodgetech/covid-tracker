import React, { useState, useRef, useEffect } from "react";
import ReactMapGL, { Popup } from "react-map-gl";
import useSupercluster from "use-supercluster";

import Loading from "./components/Loading";
import ClusterInfo from "./components/ClusterInfo";
import Clusters from "./components/Clusters";
import Panel from './components/Panel';
import { cases, recovered } from "./data/data.json";

export default function App() {
  const [viewport, setViewport] = useState({
    latitude: 17.124,
    longitude: -87.567,
    width: "100vw",
    height: "100vh",
    zoom: 7.3,
  });
  const [popupInfo, setPopupInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const mapRef = useRef();

  const points = [];

  cases.forEach((caseValue) => {
    const casesCount = caseValue.active;

    for (let i = 0; i < casesCount; i++) {
      const point = {
        type: "Feature",
        properties: { cluster: false, text: `${caseValue.district} District` },
        geometry: {
          type: "Point",
          coordinates: [
            parseFloat(caseValue.longitude),
            parseFloat(caseValue.latitude),
          ],
        },
      };
      points.push(point);
    }
  });

  const recoveredPoints = [];
  for (let i = 0; i < recovered.total; i++) {
    const point = {
      type: "Feature",
      properties: { cluster: false, text: 'Countrywide Recoveries' },
      geometry: {
        type: "Point",
        coordinates: [
          parseFloat(recovered.longitude),
          parseFloat(recovered.latitude),
        ],
      },
    };
    recoveredPoints.push(point);
  }

  const bounds = mapRef.current
    ? mapRef.current.getMap().getBounds().toArray().flat()
    : null;

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom: viewport.zoom,
    options: { radius: 75, maxZoom: 20 },
  });

  const {
    clusters: recoveredClusters,
    supercluster: recoveredSupercluster,
  } = useSupercluster({
    points: recoveredPoints,
    bounds,
    zoom: viewport.zoom,
    options: { radius: 75, maxZoom: 20 },
  });

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <Loading />;

  return (
    <React.Fragment>
      <div className="wrapper">
        <div className="column panel">
          <Panel />
        </div>
        <div className="column map">
          <ReactMapGL
            {...viewport}
            maxZoom={20}
            mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
            onViewportChange={(newViewport) => {
              setViewport({ ...newViewport });
            }}
            mapStyle="mapbox://styles/mapbox/dark-v9"
            ref={mapRef}
            scrollZoom={false}
            dragPan={false}
            touchZoom={false}
            doubleClickZoom={false}
            touchRotate={false}
          >
            {popupInfo && (
              <Popup
                tipSize={5}
                anchor="bottom"
                longitude={popupInfo.longitude}
                latitude={popupInfo.latitude}
                closeOnClick={true}
                onClose={() => setPopupInfo(null)}
                offsetLeft={26}
                className="cluster-popup"
              >
                <ClusterInfo textInfo={popupInfo.text} />
              </Popup>
            )}
            <Clusters
              clusters={clusters}
              recoveredClusters={recoveredClusters}
              supercluster={supercluster}
              recoveredSupercluster={recoveredSupercluster}
              viewport={viewport}
              setViewport={setViewport}
              points={points}
              setPopupInfo={setPopupInfo}
            />
          </ReactMapGL>
        </div>
      </div>
    </React.Fragment>
  );
}
