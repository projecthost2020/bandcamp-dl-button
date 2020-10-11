// ==UserScript==
// @name         Bandcamp Download Button
// @namespace    https://*.bandcamp.com/
// @version      2.0.0
// @description  Add Download Button to tracks on Bandcamp
// @author       You
// @match        https://*.bandcamp.com/*
// @grant        GM_download
// @connect      bandcamp.com *.bandcamp.com *.bcbits.com
// ==/UserScript==

(function() {
    'use strict';
     window.addEventListener('load', function(){
         var canUseGM_download = typeof GM_download == 'function';
         var betterDownloadMp3 = function(e) {
             if (!canUseGM_download) {
                 return;
             }
             e.preventDefault();
             e.stopPropagation();
             var anchor = e.target;
             anchor.setAttribute('disabled', 1);
             var oldAnchorText = anchor.innerText;
             anchor.innerText = '[Loading ...]';
             var gmDownload = GM_download({
                 url: anchor.getAttribute('href'),
                 name: anchor.getAttribute('download'),
                 saveAs: true,
                 onload: function(evt){
                     console.debug(evt);
                     anchor.innerText = oldAnchorText;
                     anchor.setAttribute('disabled', null);
                 },
                 onerror: function(evt){
                     console.error(evt);
                     anchor.innerText = oldAnchorText;
                     anchor.setAttribute('disabled', null);
                 },
                 ontimeout: function(evt){
                     console.error(evt);
                     anchor.innerText = oldAnchorText;
                     anchor.setAttribute('disabled', null);
                 },
                 onprogress: function(evt){
                     console.debug(evt);
                     var percent = Math.floor((evt.loaded / evt.total) * 100);
                     anchor.innerText = '[Loading '+percent+'%]';
                 }
             });
             window.addEventListener('beforeunload', function() {
                 if (gmDownload && typeof gmDownload.abort === 'function'){
                     try {
                         gmDownload.abort();
                         console.error('Download stopped due to page unload.');
                     } catch (e){ console.error(e); }
                 }
             });
             window.addEventListener('unload', function() {
                 if (gmDownload && typeof gmDownload.abort === 'function'){
                     try {
                         gmDownload.abort();
                         console.error('Download stopped due to page unload.');
                     } catch (e){ console.error(e); }
                 }
             });
         };
         if (!document.querySelector('[data-tralbum]')) { return; }
         var tralbumData = null;
         try {
             tralbumData = JSON.parse(document.querySelector('[data-tralbum]').getAttribute('data-tralbum'));
         } catch (e) { console.error(e); return; }
         if (!tralbumData || typeof tralbumData !== 'object' || !tralbumData.trackinfo || !tralbumData.trackinfo.length) {
             console.error('Bandcamp Download Button: Failed to parse album data!');
             console.log(tralbumData);
         }
         var track = null;
         var dom_elem = null;
         var dl_a = null;
         var dl_fname = null;
         var title_link = null;
         var tracks = tralbumData.trackinfo;
         var dl_copy_fname = null;
         if (document.querySelector('.track_list')){
             for (var i = 0; i < tracks.length; i++) {
                 track = tracks[i];
                 if (track.title_link && track.file && track.file['mp3-128']){
                     title_link = track.title_link;
                     dom_elem = document.querySelector('.track_list .title a[href*="'+title_link+'"]');
                     if (dom_elem) {
                         dom_elem = dom_elem.parentNode;
                         dl_a = document.createElement('a');
                         dl_a.setAttribute('href', track.file['mp3-128']);
                         dl_a.innerHTML = '[Download MP3 128k]';
                         dl_fname = track.title_link.split('/').pop()+'.mp3';
                         dl_a.setAttribute('title', dl_fname);
                         dl_a.setAttribute('download', dl_fname);
                         dl_a.classList.add('dl_link_128k');
                         dl_a.style.display = 'block';
                         dl_a.style.paddingTop = '.5rem';
                         dl_a.setAttribute('target', '_blank');
                         dom_elem.appendChild(dl_a);
                         dl_a.addEventListener('click', betterDownloadMp3);

                         if (!canUseGM_download){
                             dl_copy_fname = document.createElement('input');
                             dl_copy_fname.style.display = 'block';
                             dl_copy_fname.style.marginTop = '.5rem';
                             dl_copy_fname.style.borderRadius = '.2rem';
                             dl_copy_fname.setAttribute('disabled', true);
                             dl_copy_fname.value = dl_fname;
                             dom_elem.appendChild(dl_copy_fname);
                         }
                     }
                 }
             }
         } else {
             dom_elem = document.querySelector('#trackInfoInner .hd');
             if (!dom_elem) {
                 console.error('Cannot find element (#trackInfoInner .hd).');
                 return;
             }
             track = tracks[0];
             if (track.title_link && track.file && track.file['mp3-128']){
                 title_link = track.title_link;
                 dl_a = document.createElement('a');
                 dl_a.setAttribute('href', track.file['mp3-128']);
                 dl_a.innerHTML = '[Download MP3 128k]';
                 dl_fname = track.title_link.split('/').pop()+'.mp3';
                 dl_a.setAttribute('title', dl_fname);
                 dl_a.setAttribute('download', dl_fname);
                 dl_a.classList.add('dl_link_128k');
                 dl_a.style.display = 'block';
                 dl_a.style.paddingTop = '.5rem';
                 dl_a.setAttribute('target', '_blank');
                 dom_elem.appendChild(dl_a);
                 dl_a.addEventListener('click', betterDownloadMp3);

                 if (!canUseGM_download){
                     dl_copy_fname = document.createElement('input');
                     dl_copy_fname.style.display = 'block';
                     dl_copy_fname.style.marginTop = '.5rem';
                     dl_copy_fname.style.borderRadius = '.2rem';
                     dl_copy_fname.value = dl_fname;
                     dl_copy_fname.setAttribute('disabled', true);
                     dom_elem.appendChild(dl_copy_fname);
                 }
             }
         }
     });
})();
