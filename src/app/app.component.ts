import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  geoToH3,
  h3ToGeoBoundary,
  kRing as h3KRing,
  kRingDistances,
} from 'h3-js';
import { MapDirectionsResponse } from '@angular/google-maps';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  apiLoaded: Observable<boolean>;
  options: google.maps.MapOptions = {
    center: { lat: -8.0969728, lng: -79.0462464 },
    zoom: 14,
  };
  markerOptions: google.maps.MarkerOptions = { draggable: false };
  markerPositions: google.maps.LatLngLiteral[] = [];
  defaultCabPositions = [{ lat: -8.0969728, lng: -79.0462464}];
  propsH3 = {
    kringSize: 1,
    lat: -8.0969728,
    lng: -79.0462464,
    resolution: 9,
    h3Index: '',
    hexagons: [''],
    polyline: [{ lat: 0, lng: 0 }],
  };
  propsH3Clone = { ...this.propsH3 };
  polygonH3Options: google.maps.PolygonOptions = {
    visible: true,
    fillColor: '#2e2e2e',
    fillOpacity: 0.5,
    strokeWeight: 3
  };
  polygonH3OptionsClone: google.maps.PolygonOptions = {
    visible: true,
    fillColor: '#a2kk22',
    fillOpacity: 0.2,
    strokeWeight: 1

  }

  constructor(httpClient: HttpClient) {
    this.setDefaultPositions();
    this.apiLoaded = httpClient
      .jsonp(
        'https://maps.googleapis.com/maps/api/js?key=AIzaSyCgqPOKp3UswiDJE8m9erb9cfHvVEsjA3k',
        'callback'
      )
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );

    this.getH3();
    this.getHexagons();
  }

  setDefaultPositions() {
    for (let index = 0; index < 20; index++) {
      const element: any = this.defaultCabPositions[index];
      element.lat = this.propsH3.lat;
      element.lng = this.propsH3.lng;
      this.defaultCabPositions.push(element);
    }
  }


  getH3() {
    this.propsH3.h3Index = geoToH3(
      this.propsH3.lat,
      this.propsH3.lng,
      this.propsH3.resolution
    );
    this.propsH3Clone.h3Index = this.propsH3.h3Index;
  }

  getHexagons() {
    this.propsH3.hexagons = h3KRing(
      this.propsH3.h3Index,
      1
    );
    this.propsH3Clone.hexagons = this.propsH3.hexagons;
  }

  h3ToPolyline(h3idx: any) {
    let hexBoundary = h3ToGeoBoundary(h3idx);
    hexBoundary.push(hexBoundary[0]);
    let arr = [];
    for (const i of hexBoundary) {
      arr.push({ lat: i[0], lng: i[1] });
    }

    return arr;
  }

  setPolygon() { }

  getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  addMarker(event: google.maps.MapMouseEvent | any) {
    this.markerPositions.push(event.latLng.toJSON());
  }

  polylineClick(event: any, hex: string, isClone: boolean, index?: number) {
    let indexHexagon = this.propsH3Clone.hexagons.findIndex(hexagon => hexagon === hex);
    if (!isClone) {
      this.propsH3.hexagons = this.propsH3.hexagons.filter(
        (hexagon) => hexagon !== hex
      );
    } else {
      this.propsH3.hexagons.splice(indexHexagon, 0, hex);
    }
  }
}
