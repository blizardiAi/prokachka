/* Offline cache. Change VERSION when you upload a new index.html. */
var VERSION="pp-v1";
var CORE=["./","index.html","manifest.webmanifest","icon-180.png","icon-192.png","icon-512.png","favicon.svg"];
self.addEventListener("install", function(e){ e.waitUntil(caches.open(VERSION).then(function(c){ return c.addAll(CORE); }).then(function(){ return self.skipWaiting(); })); });
self.addEventListener("activate", function(e){ e.waitUntil(caches.keys().then(function(keys){ return Promise.all(keys.filter(function(k){ return k!==VERSION; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); })); });
self.addEventListener("fetch", function(e){
  var req=e.request; if(req.method!=="GET") return;
  var url=new URL(req.url);
  if(req.mode==="navigate"){ // page: fresh from the network, cached copy when offline
    e.respondWith(fetch(req).then(function(r){ var copy=r.clone(); caches.open(VERSION).then(function(c){ c.put("index.html", copy); }); return r; }).catch(function(){ return caches.match("index.html"); }));
    return;
  }
  if(url.origin===location.origin || /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){ // files and fonts: cache first, refresh in the background
    e.respondWith(caches.match(req).then(function(hit){
      var net=fetch(req).then(function(r){ if(r && (r.ok || r.type==="opaque")){ var copy=r.clone(); caches.open(VERSION).then(function(c){ c.put(req, copy); }); } return r; }).catch(function(){ return hit; });
      return hit || net;
    }));
  }
});
