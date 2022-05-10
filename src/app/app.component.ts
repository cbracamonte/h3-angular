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
  defaultCabPositions = [{ lat: -8.0969728, lng: -79.0462464, color: 'blue' }];
  propsH3 = {
    kringSize: 1,
    lat: -8.0969728,
    lng: -79.0462464,
    resolution: 9,
    plantingMode: 'RIDER',
    cabPositions: this.defaultCabPositions,
    riderH3Index: '',
    hexagons: [''],
    polyline: [{ lat: 0, lng: 0 }],
  };
  polygonH3Options: google.maps.PolygonOptions = {
    visible: true,
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.35,
  };

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

    this.getIdx();
    this.getRiderH3();
    this.getHexagons();
  }

  setDefaultPositions() {
    for (let index = 0; index < 20; index++) {
      const element: any = this.defaultCabPositions[index];
      element.lat = this.propsH3.lat;
      element.lng = this.propsH3.lng;
      element.color = 'blue';
      this.defaultCabPositions.push(element);
    }
    console.log(this.defaultCabPositions);
  }

  getIdx() {
    return geoToH3(this.propsH3.lat, this.propsH3.lng, this.propsH3.resolution);
  }

  getRiderH3() {
    this.propsH3.riderH3Index = geoToH3(
      this.propsH3.lat,
      this.propsH3.lng,
      this.propsH3.resolution
    );
  }

  getHexagons() {
    this.propsH3.hexagons = h3KRing(
      this.propsH3.riderH3Index,
      this.propsH3.kringSize
    );
  }

  h3ToPolyline(h3idx: any) {
    let hexBoundary = h3ToGeoBoundary(h3idx);
    hexBoundary.push(hexBoundary[0]);
    let arr = [];
    for (const i of hexBoundary) {
      arr.push({ lat: i[0], lng: i[1], color: '#d2e2de' });
    }

    return arr;
  }

  setPolygon() {}

  getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  addMarker(event: google.maps.MapMouseEvent | any) {
    this.markerPositions.push(event.latLng.toJSON());
  }

  polylineClick(event: any, hex: string) {
    /*this.propsH3.hexagons = this.propsH3.hexagons.filter(
      (hexagon) => hexagon !== hex
    );*/
    console.log(this.propsH3);
  }
}
