<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { getLocale, setLocale, type Locale } from '$lib/paraglide/runtime';

  let isEnglish = $state(getLocale() === "en");

  const localToUse = (isEnglish: boolean): Locale => isEnglish ? "en" : "es";

  const toggleLanguage = () => {
    isEnglish = !isEnglish;
    setLocale(localToUse(isEnglish), { reload: true });
  };
</script>

<label class="inline-flex items-center cursor-pointer">
  <span class="mx-3 text-sm font-medium text-gray-900 dark:text-gray-300">{m['locales.english']()}</span>
  <input onchange={toggleLanguage} type="checkbox" value="" checked={!isEnglish} class="sr-only peer">
  <div class="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
  <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">{m['locales.spanish']()}</span>
</label>
