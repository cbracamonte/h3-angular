import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  geoToH3,
  h3ToGeoBoundary,
  kRing as h3KRing
} from 'h3-js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  // Cargamos el mapa asincronicamente
  apiLoaded: Observable<boolean>;
  // Definimos las opciones para el mapa
  options = {
    center: { lat: -8.0969728, lng: -79.0462464 },
    zoom: 14,
  };
  // Creamos el obj para las propiedades de H3
  propsH3 = {
    kringSize: 1,
    lat: -8.0969728,
    lng: -79.0462464,
    resolution: 9,
    h3Index: '',
    hexagons: [''],
    polyline: [{ lat: 0, lng: 0 }],
  };
  // Clonamos para crear otro poligono
  propsH3Clone = { ...this.propsH3 };
  // Configuramos las propiedades del poligono
  polygonH3Options = {
    visible: true,
    fillColor: '#2e2e2e',
    fillOpacity: 0.5,
    strokeWeight: 3
  };
  polygonH3OptionsClone = {
    visible: true,
    fillColor: '#a2kk22',
    fillOpacity: 0.2,
    strokeWeight: 1

  }

  constructor(httpClient: HttpClient) {
    // Cargamos el mapa
    this.apiLoaded = httpClient
      .jsonp(
        'https://maps.googleapis.com/maps/api/js?key=AIzaSyCgqPOKp3UswiDJE8m9erb9cfHvVEsjA3k',
        'callback'
      )
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
    // Invocamos las funciones de H3
    this.getH3();
    this.getHexagons();
  }

  getH3() {
    /* Creamos el punto(H3) de base
      lat: coordenada latitud
      lng: coordenada longitud
      resolution: resolucion para H3 puede ser: (7,8,9...15)
    */
    this.propsH3.h3Index = geoToH3(
      this.propsH3.lat,
      this.propsH3.lng,
      this.propsH3.resolution
    );
    // Clonamos la referencia del punto H3
    this.propsH3Clone.h3Index = this.propsH3.h3Index;
  }


  getHexagons() {
    /* Obtenemos los puntos H3 para formar los hexagonos
      h3Index: referencia del punto H3
      ringSize: tamaño del anillo
    */
    this.propsH3.hexagons = h3KRing(
      this.propsH3.h3Index,
      1
    );
    this.propsH3Clone.hexagons = this.propsH3.hexagons;
  }

  h3ToPolyline(h3idx: any) {
    /*
      Convertimos los puntos H3 a puntos (lat y lng)
      para que se dibuje los poligonos generados por H3
    */
    let hexBoundary = h3ToGeoBoundary(h3idx);
    hexBoundary.push(hexBoundary[0]);
    let arr = [];
    for (const i of hexBoundary) {
      arr.push({ lat: i[0], lng: i[1] });
    }

    return arr;
  }

  polylineClick(event: any, hex: string, isClone: boolean) {
    /**
     * Funcionalidad para eliminar y añadir los hexagonos generados por H3
     * Esta solución es la que se encontró para poder eliminar un hexagono pero no perder sus coordenadas para que asi el usuario pueda añadirlo nuevamente
     */
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
