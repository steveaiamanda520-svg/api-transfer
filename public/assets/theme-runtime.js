(function () {
  'use strict';
  var key = 'modelport:theme:v1';
  var ids = ['midnight','graphite','ocean','forest','plum','ember','porcelain','sand'];
  var media = window.matchMedia('(prefers-color-scheme: dark)');
  var preference = 'midnight';
  try { var saved = localStorage.getItem(key); if (ids.indexOf(saved) !== -1 || saved === 'system') preference = saved; } catch (_) {}
  function apply(value, persist) {
    if (ids.indexOf(value) === -1 && value !== 'system') return;
    preference = value;
    document.documentElement.dataset.theme = value === 'system' ? (media.matches ? 'midnight' : 'porcelain') : value;
    document.documentElement.dataset.themePreference = value;
    if (persist) { try { localStorage.setItem(key, value); } catch (_) {} }
    document.querySelectorAll('[data-modelport-theme]').forEach(function (select) { select.value = value; });
    document.dispatchEvent(new CustomEvent('modelport:theme-change', {detail:value}));
  }
  window.ModelPortTheme = {set:function(value){apply(value,true);},get:function(){return preference;}};
  apply(preference,false);
  media.addEventListener('change',function(){if(preference==='system')apply('system',false);});
  window.addEventListener('storage',function(event){if(event.key===key)apply(event.newValue||'midnight',false);});
  document.addEventListener('change',function(event){if(event.target.matches('[data-modelport-theme]'))apply(event.target.value,true);});
  document.addEventListener('DOMContentLoaded',function(){apply(preference,false);});
})();
