<template>
  <!-- Центрирование + стеклянная карточка -->
  <div class="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8 text-white">
      <slot />
    </div>
  </div>
</template>