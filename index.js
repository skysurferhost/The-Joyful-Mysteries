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

(function() {
  var Marzipano = window.Marzipano;
  var bowser = window.bowser;
  var screenfull = window.screenfull;
  var data = window.APP_DATA;

  /* ---------------- AUDIO ADDITION (NON-DESTRUCTIVE) ---------------- */

  var audioMap = [
    'Joyful-Mysteries-1.mp3',
    'Joyful-Mysteries-2.mp3',
    'Joyful-Mysteries-3.mp3',
    'Joyful-Mysteries-4.mp3',
    'Joyful-Mysteries-5.mp3'
  ];

  var audio = new Audio();
  audio.loop = true;
  audio.volume = 0.7;

  var volumeToggle = document.getElementById('volumeToggle');
  var volumeContainer = document.getElementById('volumeContainer');
  var volumeSlider = document.getElementById('volumeSlider');

  volumeToggle.addEventListener('click', function () {
    volumeContainer.classList.toggle('visible');
  });

  volumeSlider.addEventListener('input', function () {
    audio.volume = parseFloat(this.value);
  });

  function playSceneAudio(index) {
    if (audioMap[index]) {
      audio.src = audioMap[index];
      audio.play().catch(function(){});
    }
  }

  /* ---------------- ORIGINAL CODE CONTINUES ---------------- */

  var panoElement = document.querySelector('#pano');
  var sceneNameElement = document.querySelector('#titleBar .sceneName');
  var sceneListElement = document.querySelector('#sceneList');
  var sceneElements = document.querySelectorAll('#sceneList .scene');

  var viewer = new Marzipano.Viewer(panoElement);

  var scenes = data.scenes.map(function(sceneData, index) {
    var source = Marzipano.ImageUrlSource.fromString(
      "tiles/" + sceneData.id + "/{z}/{f}/{y}/{x}.jpg",
      { cubeMapPreviewUrl: "tiles/" + sceneData.id + "/preview.jpg" }
    );

    var geometry = new Marzipano.CubeGeometry(sceneData.levels);
    var view = new Marzipano.RectilinearView(sceneData.initialViewParameters);

    var scene = viewer.createScene({
      source: source,
      geometry: geometry,
      view: view,
      pinFirstLevel: true
    });

    return {
      index: index,
      data: sceneData,
      scene: scene,
      view: view
    };
  });

  function switchScene(scene) {
    scene.view.setParameters(scene.data.initialViewParameters);
    scene.scene.switchTo();
    sceneNameElement.innerHTML = scene.data.name;
    playSceneAudio(scene.index);

    sceneElements.forEach(function(el) {
      el.classList.toggle('current', el.dataset.id === scene.data.id);
    });
  }

  scenes.forEach(function(scene) {
    var el = document.querySelector(
      '#sceneList .scene[data-id="' + scene.data.id + '"]'
    );
    el.addEventListener('click', function() {
      switchScene(scene);
    });
  });

  switchScene(scenes[0]);

})();
