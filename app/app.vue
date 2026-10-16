<template>
  <div class="min-h-screen w-full flex flex-col bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4c1d95] text-white font-sans">
    <!-- Шапка на всех страницах -->
    <TemplateAppHeader />

    <!-- Контент -->
    <main class="flex-1">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </main>

    <!-- Футер на всех страницах -->
    <TemplateAppFooter />

    <!-- Глобальные баннеры поверх всего -->
    <TemplateBannersHost />
  </div>
</template>
