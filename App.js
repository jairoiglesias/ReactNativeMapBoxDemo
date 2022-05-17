import React, {useEffect, useState} from 'react';
import { View, StyleSheet, Text, Button, TouchableOpacity} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import {area, polygon} from '@turf/turf'

const MAPBOX_TOKEN = 'pk.eyJ1IjoiamlnbGVzaWFzIiwiYSI6ImNsMTk0MWFyZTFzaHkzb3Ywa3U2bjVvYTYifQ.0yNaD5SF1ev3HfrAr3n0_g'
MapboxGL.setAccessToken(MAPBOX_TOKEN)

const defaultCamera = {
  // centerCoordinate: [-46.640630594210336, -23.5934192163365],    // Vila Mariana
  // centerCoordinate: [-67.88841324613868, -9.998194797250836],       
  centerCoordinate: [-67.89703547276694, -9.983667029799062],       // R. Dom Pedro II - Bosque - Rio Branco - AC
  animationMode: 'flyTo',
  zoomLevel: 15,
  minZoomLevel: 20,
  // pitch: 30,
  
}

const App = () => {

  const [markers, setMarkers] = useState([])
  const [polygonArea, setPolygonArea] = useState()

  useEffect(() => {
    MapboxGL.locationManager.start();

    return () => {
      MapboxGL.locationManager.stop();
    };

  }, []);

  useEffect(() => {
    console.log(markers.length)
    if(markers.length >= 3){
      const polygonStruct = polygon([[
        ...markers,
        markers[0]
      ]])
      const polygonArea = area(polygonStruct)
      const polygonAreaFormatted = Math.round(polygonArea * 100) / 100;
      setPolygonArea(polygonAreaFormatted)
      console.log(polygonAreaFormatted)
    }
  }, [markers])

  const handleReset = () => {
    setMarkers([])
    setPolygonArea('')
  }

  const handleTouchMap = (e) => {
    console.log('Coordinates At Point', e.geometry.coordinates)
    setMarkers(prev => [...prev, e.geometry.coordinates])
  }

  const DefaultButton = (props) => {
    return <TouchableOpacity {...props} style={{
      backgroundColor: 'green',
      height: 30,
      width: 50,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 5
    }}>
      <Text style={{color: 'white'}}>{props.title}</Text>
    </TouchableOpacity>
  }

  const MapControls = () => {

    return <View
      style={{
        position: 'absolute',
        backgroundColor: 'white',
        height: 100,
        width: '90%',
        bottom: 40,
        zIndex: 1,
        borderRadius: 10,
        padding: 10
      }}
    >
      <DefaultButton title="Reset" onPress={handleReset}/>
      <Text>Area: {polygonArea}</Text>
    </View>  }

  return (
    <View style={styles.page}>

        <MapControls />
        
        <MapboxGL.MapView 
          style={styles.map}
          styleURL={MapboxGL.StyleURL.Satellite}
          onPress={handleTouchMap}
        >
          <MapboxGL.Camera 
            {...defaultCamera}
          />

          <MapboxGL.ShapeSource
            id="source1"
            lineMetrics={true}
            shape={{
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: markers,
              },
            }}>
            <MapboxGL.LineLayer id="layer1" style={styles.lineLayer} />
          </MapboxGL.ShapeSource>

          <MapboxGL.ShapeSource
            id="source2"
            shape={{
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  ...markers
                ]]
              },
            }}>
            <MapboxGL.FillLayer id="fill" style={{ fillColor: "blue", fillOpacity: 0.1}} />
            <MapboxGL.LineLayer
              id="line"
              style={{ lineColor: "red", lineWidth: 2 , lineOpacity: 0.3}}
            />
          </MapboxGL.ShapeSource>

          {markers.map((markerItem, markerIndex) => {
            return <MapboxGL.PointAnnotation
              id={Number(markerIndex)}
              key={`point-annotation-${markerIndex}`} 
              coordinate={markerItem}
            >
              <View
                style={styles.pointAnnotation}
              />
            </MapboxGL.PointAnnotation>

          })}
         

          <MapboxGL.UserLocation />
        </MapboxGL.MapView>
        
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  pointAnnotation: {
    height: 20,
    width: 20,
    backgroundColor: "green",
    borderRadius: 30,
    borderColor: "#fff",
    borderWidth: 3,
  },
  lineLayer: {
    lineColor: 'red',
    lineCap: 'round',
    lineJoin: 'round',
    lineWidth: 5,
    lineGradient: [
      'interpolate',
      ['linear'],
      ['line-progress'],
      0,
      'blue',
      0.1,
      'royalblue',
      0.3,
      'cyan',
      0.5,
      'lime',
      0.7,
      'yellow',
      1,
      'red',
    ],
  },
  
});

export default App;
