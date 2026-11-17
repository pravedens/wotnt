<template>
  <div class="bible-verse-section">
    <h2 class="section-title">Стих дня</h2>
    
    <div class="bible-verse-card">
      <div v-if="pending" class="loading">Загрузка...</div>
      <div v-else-if="error" class="error">Не удалось загрузить стих дня</div>
      <blockquote v-else-if="verse" class="verse-block">
        <p class="verse-text">«{{ verse.text }}»</p>
        <footer class="verse-reference">— {{ verse.reference }}</footer>
      </blockquote>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig();

const { data: verse, pending, error } = await useFetch('/api/daily-verse', {
  baseURL: config.public.apiBase,
  key: 'daily-verse',
});
</script>

<style scoped>
.bible-verse-section {
  margin-top: 3rem; /* Отступ от карточек постов */
  margin-bottom: 3rem;
}

.section-title {
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  /* Можно добавить легкую тень для читаемости, если фон сложный */
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.bible-verse-card {
  /* Цвет карточки подстраиваем под фон страницы, делаем его чуть светлее и прозрачнее */
  background: rgba(255, 255, 255, 0.05); 
  /* Если у карточек постов был градиент, можно использовать его с прозрачностью */
  /* background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%); */
  
  border: 1px solid rgba(255, 255, 255, 0.1); /* Тонкая светлая рамка */
  border-left: 4px solid #3b82f6; /* Синяя полоска слева для акцента (или возьмите цвет из кнопок) */
  border-radius: 12px;
  padding: 1.5rem 2rem;
  
  /* Легкая тень для объема */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px); /* Эффект матового стекла (если поддерживается) */
}

.verse-text {
  font-style: italic;
  font-size: 1.15rem;
  line-height: 1.7;
  color: #f8fafc; /* Светло-серый, почти белый */
  margin: 0;
}

.verse-reference {
  margin-top: 1rem;
  font-weight: 600;
  font-size: 1rem;
  color: #93c5fd; /* Голубоватый цвет, чтобы гармонировал с синей полоской */
}

.loading, .error {
  color: #cbd5e1;
  font-style: italic;
}

.error {
  color: #fca5a5;
}
</style>