/*
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

(function () {
  var Marzipano = window.Marzipano;
  var bowser = window.bowser;
  var screenfull = window.screenfull;
  var data = window.APP_DATA;

  /* =========================
     🎵 AUDIO SETUP
  ========================== */

  var sceneAudioMap = {
    "0-1-the-annunciation": "Joyful-Mysteries-1.mp3",
    "1-2-the-visitation": "Joyful-Mysteries-2.mp3",
    "2-3-the-nativity": "Joyful-Mysteries-3.mp3",
    "3-4-the-presentation-of-jesus": "Joyful-Mysteries-4.mp3",
    "4-5-the-finding-of-jesus-in-the-temple": "Joyful-Mysteries-5.mp3"
  };

  var audio = new Audio();
  audio.loop = true;
  audio.volume = 0.8;
  audio.preload = "auto";

  /* =========================
     DOM ELEMENTS
  ========================== */

  var panoElement = document.querySelector('#pano');
  var sceneNameElement = document.querySelector('#titleBar .sceneName');
  var sceneListElement = document.querySelector('#sceneList');
  var sceneElements = document.querySelectorAll('#sceneList .scene');
  var sceneListToggleElement = document.querySelector('#sceneListToggle');
  var autorotateToggleElement = document.querySelector('#autorotateToggle');
  var fullscreenToggleElement = document.querySelector('#fullscreenToggle');

  var volumeToggle = document.querySelector('#volumeToggle');
  var volumeSlider = document.querySelector('#volumeSlider');

  /* =========================
     VOLUME UI
  ========================== */

  volumeToggle.addEventListener('click', function (e) {
    e.stopPropagation();
    volumeSlider.classList.toggle('open');
  });

  volumeSlider.addEventListener('input', function () {
    audio.volume = this.value;
  });

  document.addEventListener('click', function () {
    volumeSlider.classList.remove('open');
  });

  /* =========================
     VIEWER SETUP
  ========================== */

  var viewer = new Marzipano.Viewer(panoElement, {
    controls: { mouseViewMode: data.settings.mouseViewMode }
  });

  var scenes = data.scenes.map(function (sceneData) {
    var source = Marzipano.ImageUrlSource.fromString(
      "tiles/" + sceneData.id + "/{z}/{f}/{y}/{x}.jpg",
      { cubeMapPreviewUrl: "tiles/" + sceneData.id + "/preview.jpg" }
    );

    var geometry = new Marzipano.CubeGeometry(sceneData.levels);
    var limiter = Marzipano.RectilinearView.limit.traditional(
      sceneData.faceSize,
      100 * Math.PI / 180,
      120 * Math.PI / 180
    );

    var view = new Marzipano.RectilinearView(
      sceneData.initialViewParameters,
      limiter
    );

    var scene = viewer.createScene({
      source: source,
      geometry: geometry,
      view: view,
      pinFirstLevel: true
    });

    return {
      data: sceneData,
      scene: scene,
      view: view
    };
  });

  /* =========================
     SCENE SWITCHING + MUSIC
  ========================== */

  function switchScene(scene) {
    scene.view.setParameters(scene.data.initialViewParameters);
    scene.scene.switchTo();
    updateSceneName(scene);
    updateSceneList(scene);
    playSceneMusic(scene.data.id);
  }

  function playSceneMusic(sceneId) {
    var src = sceneAudioMap[sceneId];
    if (!src) return;

    if (audio.src.indexOf(src) === -1) {
      audio.src = src;
      audio.play().catch(function () {
        document.addEventListener('click', function () {
          audio.play();
        }, { once: true });
      });
    }
  }

  /* =========================
     UI HELPERS
  ========================== */

  function updateSceneName(scene) {
    sceneNameElement.textContent = scene.data.name;
  }

  function updateSceneList(scene) {
    sceneElements.forEach(function (el) {
      el.classList.toggle(
        'current',
        el.getAttribute('data-id') === scene.data.id
      );
    });
  }

  sceneElements.forEach(function (el) {
    var id = el.getAttribute('data-id');
    var scene = scenes.find(s => s.data.id === id);

    el.addEventListener('click', function () {
      switchScene(scene);
    });
  });

  /* =========================
     INIT
  ========================== */

  switchScene(scenes[0]);

})();
