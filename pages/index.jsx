/* eslint-disable arrow-body-style */
import React, { useRef, useEffect, useState } from 'react';
// eslint-disable-line import/no-webpack-loader-syntax
// eslint-disable-next-line import/no-webpack-loader-syntax
import mapboxgl from '!mapbox-gl';
import Layout from '@/components/Layout';
import Tabs from '@/components/Tabs/Tabs';

import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken =
  'pk.eyJ1IjoieGMzMDAwIiwiYSI6ImNsN25tZ3NnOTBtbWkzd28waTdqaWNwd3cifQ.-njnUu9y6sAA2XIYBvb9CA';

const Home = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(9);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom,
    });
  });

  return (
    <Layout>
      <div className="grid grid-cols-2 gap-4">
        <Tabs />
        <div ref={mapContainer} className="map-container" />
      </div>
    </Layout>
  );
};

export default Home;
