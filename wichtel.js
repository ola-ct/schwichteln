(function(window) {
'use strict';

const MaxCounter = 10000000;


let shuffle = a => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let main = () => {
  let tableEl = document.getElementById('table');
  let statsEl = document.getElementById('stats');
  let worker = new Worker('worker.js');
  let items = ['&#x1F354;', '&#x1F355;', '&#x1F356;', '&#x1F357;', '&#x1F35B;', '&#x1F35C;', '&#x1F35D;', '&#x1F35F;', '&#x1F366;', '&#x1F369;', '	&#x1F36B;'];
  const N = items.length;
  let players = [];
  let running = true;

  document.getElementById('button-stop').addEventListener('click', () => {
    running = !running;
  });
  document.getElementById('button-restart').addEventListener('click', () => {
    init();
  });

  let init = () => {
    running = true;
    while (tableEl.firstChild) {
      tableEl.removeChild(tableEl.firstChild);
    }
    players = [];
    for (let i = 0; i < N; ++i) {
      let playerDiv = document.createElement('div');
      playerDiv.className = 'player';
      let wantedDiv = document.createElement('div');
      wantedDiv.className = 'wanted';
      let itemsDiv = document.createElement('div');
      itemsDiv.className = 'items';
      itemsDiv.setAttribute('id', `player-items-${i}`);
      let cacheDiv = document.createElement('div');
      cacheDiv.className = 'cache';
      itemsDiv.setAttribute('id', `player-cache-${i}`);
      playerDiv.appendChild(itemsDiv);
      playerDiv.appendChild(cacheDiv);
      playerDiv.appendChild(wantedDiv);
      players.push({
        wanted: wantedDiv,
        items: itemsDiv,
        cache: cacheDiv
      });
      tableEl.appendChild(playerDiv);
    }  
    shuffle(items);
    worker.postMessage(JSON.stringify({
      cmd: 'initialize',
      N: N,
      items: items
    }));
  }

  init();

  worker.onmessage = function(e) {
    let data = JSON.parse(e.data);
    if (data.callCount !== undefined && data.callCount < MaxCounter) {
      statsEl.innerText = `${(1e-3*data.dt).toFixed(1)} s\n${data.callCount}`;
      let itemsLeft = data.players.map(player => player.owned).flat();
      data.players.forEach(player => {
        players[player.idx].items.innerHTML = player.owned.join('');
        players[player.idx].cache.innerHTML = player.cache;
        players[player.idx].wanted.innerHTML = player.wanted;
        if (player.cache === undefined)
          running = false;
      });
      if (running && itemsLeft.length > 0) {
        setTimeout(() => {
          worker.postMessage(JSON.stringify({
            cmd: 'continue'
          }));
        }, 100);
      }
    }
    else if (data.callCount === undefined) {
      worker.postMessage(JSON.stringify({
        cmd: 'continue'
      }));
    }  
  };

}

window.addEventListener('load', main);

})(window);
