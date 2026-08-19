export const THEME_STORAGE_KEY = "admin-preview-theme-mode";

/** Runs before first paint so `light-dark()` tokens match the stored mode. */
export const themeInitScript = `(function(){try{var m=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(m!=="light"&&m!=="dark")m="dark";var e=document.documentElement;e.style.colorScheme=m;e.setAttribute("data-theme",m);}catch(e){}})();`;
