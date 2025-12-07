;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="a38c43a9-1282-33f5-f0e7-5cebeaa17785")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,3748432,e=>{"use strict";e.i(2957938);var t=e.i(1146226),n=e.i(5169864),r=e.i(5610834),i=e.i(8612999),a=e.i(5773208);let s={hard:{skeleton:"primary-light",content:"primary-dark"},soft:{skeleton:"secondary-light",content:"secondary-dark"}};function o(e,t){let n=e?"hard":"soft";return{track:"Navigation Phases ▲",color:s[n][t.phase],properties:[["Navigation Type",n]].concat(Object.entries(t).map(e=>{let[t,n]=e;return[t.split("_").map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(" "),String(n)]}))}}let u=e=>{let s,u,{phase:l,label:d,children:h,routeOverride:g}=e,f=(s=(0,r.usePathname)(),u=(0,r.useParams)(),(0,n.useMemo)(()=>{if(!u)return(0,i.computeRoute)(s,{});let{catchAll:e,...t}=u;return(0,i.computeRoute)(s,t)},[s,u])),m=g??f??"unknown",j=(0,n.useRef)(!1);(0,n.useEffect)(()=>{if(!j.current&&(j.current=!0,!c(l,"interactive",d)))return requestAnimationFrame(()=>{requestAnimationFrame(()=>{var e=l,t=m,n=d;let r=performance.now(),i={phase:e,route:t,target_env:"production",label:n,state:"interactive"};try{performance.measure(`${e} interactive`,{start:a.routerState.lastRouterTransition.startMsSinceOrigin,end:r,detail:{vercelNavigation:{isHardNavigation:a.routerState.isHardNavigation,attrs:i},devtools:o(a.routerState.isHardNavigation,i)}})}catch{}})}),()=>{"skeleton"===l||c(l,"unmounted",d)||0===a.routerState.lastRouterTransition.startMsSinceOrigin||requestAnimationFrame(()=>{let e={phase:l,route:m,label:d,target_env:"production",state:"unmounted"};performance.measure(`${l} unmount`,{start:a.routerState.lastRouterTransition.startMsSinceOrigin,end:performance.now(),detail:{vercelNavigation:{isHardNavigation:!1,attrs:e},devtools:o(a.routerState.isHardNavigation,e)}})})}},[l,m,d]);let v={phase:l,label:d,route:m,target_env:"production",state:"visible"};return(0,t.jsxs)(t.Fragment,{children:[h,(0,t.jsx)("script",{dangerouslySetInnerHTML:{__html:`
        requestAnimationFrame(() => {
          globalThis.__VERCEL_NAVIGATION_METRICS_RECORDED_MEASURES = globalThis.__VERCEL_NAVIGATION_METRICS_RECORDED_MEASURES || new Map();
          if (globalThis.__VERCEL_NAVIGATION_METRICS_RECORDED_MEASURES.has("${l} visible")) {
            
            return;
          }
          globalThis.__VERCEL_NAVIGATION_METRICS_RECORDED_MEASURES.set("${l} visible", "${d}");

          try {
            performance.measure("${l} visible", {
              end: performance.now(),
              detail: {
                vercelNavigation: {
                  isHardNavigation: true,
                  attrs: JSON.parse(${JSON.stringify(JSON.stringify(v))}),
                },
                devtools: JSON.parse(${JSON.stringify(JSON.stringify(o(!0,v)))})
              }
            });
          } catch {}
        });
      `}})]})};function l(e){let{children:n,enabled:r,phase:i,label:a,routeOverride:s}=e;return(0,t.jsxs)(t.Fragment,{children:[n,r&&(0,t.jsx)(u,{phase:i,label:a,routeOverride:s})]})}function c(e,t,n){let r=(0,a.getRecordedMeasures)();return!!r.has(`${e} ${t}`)||(r.set(`${e} ${t}`,n||"unknown"),!1)}e.s(["ConditionalNavigationMarker",()=>l,"NavigationMarker",0,u],3748432)},835469,e=>{e.v({settingsGeneral:"team-settings-general-skeleton-module__uzFQ5G__settingsGeneral"})},5216091,e=>{"use strict";var t=e.i(1146226),n=e.i(5255926),r=e.i(5807088),i=e.i(835469),a=e.i(3748432);function s(){return(0,t.jsxs)("main",{className:i.default.settingsGeneral,children:[(0,t.jsx)(a.NavigationMarker,{phase:"skeleton",label:"TeamSettingsGeneralSkeleton"}),(0,t.jsx)("section",{children:(0,t.jsx)(o,{})}),(0,t.jsx)("section",{children:(0,t.jsx)(u,{})}),(0,t.jsx)("section",{children:(0,t.jsx)(l,{})}),(0,t.jsx)("section",{children:(0,t.jsx)(c,{})}),(0,t.jsx)("section",{children:(0,t.jsx)(d,{})}),(0,t.jsx)("section",{children:(0,t.jsx)(h,{})}),(0,t.jsx)("section",{children:(0,t.jsx)(g,{})}),(0,t.jsx)("section",{children:(0,t.jsx)(f,{})}),(0,t.jsx)("section",{children:(0,t.jsx)(m,{})})]})}function o(){return(0,t.jsx)(r.default,{height:80})}function u(){return(0,t.jsx)(r.default,{height:102})}function l(){return(0,t.jsx)(r.default,{height:55})}function c(){return(0,t.jsx)(r.default,{height:102})}function d(){return(0,t.jsx)(r.default,{height:81})}function h(){return(0,t.jsx)(n.Skeleton,{height:30,width:140})}function g(){return(0,t.jsx)(r.default,{height:81})}function f(){return(0,t.jsx)(r.default,{height:36})}function m(){return(0,t.jsx)(r.default,{height:56})}e.s(["TeamSettingsGeneralSkeleton",()=>s])}]);

//# debugId=a38c43a9-1282-33f5-f0e7-5cebeaa17785
//# sourceMappingURL=ee4dabc20d055c49.js.map