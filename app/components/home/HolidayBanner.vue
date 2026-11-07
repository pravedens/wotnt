<script setup lang="ts">
import type { Holiday } from "~/types/home";

defineProps<{ holiday: Holiday }>();
</script>

<template>
  <section
    class="relative overflow-hidden rounded-3xl border border-white/10"
    :style="{
      backgroundColor: holiday.styles.bg_color,
      color: holiday.styles.text_color,
      fontFamily: holiday.styles.font_family,
    }"
  >
    <div class="flex flex-col md:flex-row items-stretch relative">
      <!-- ✅ КАРТИНКА -->
      <div
        v-if="holiday.image_url"
        class="relative w-full md:w-2/5 lg:w-1/3 h-64 md:h-auto flex-shrink-0"
      >
        <!-- Сама картинка -->
        <img
          :src="holiday.image_url"
          alt="Праздник"
          class="w-full h-full object-cover"
        />

        <!-- ✅ Градиентная маска, которая растворяет края (только на десктопе) -->
        <div
          class="absolute inset-0 hidden md:block pointer-events-none"
          :style="{
            background: `linear-gradient(to right, transparent 0%, transparent 60%, ${holiday.styles.bg_color} 100%)`,
          }"
        ></div>

        <!-- ✅ Легкое затемнение (только для мобилки, чтобы текст читался) -->
        <div
          class="absolute inset-0 md:hidden"
          :style="{ backgroundColor: holiday.styles.bg_color, opacity: 0.4 }"
        ></div>
      </div>

      <!-- ✅ ТЕКСТ -->
      <div
        class="p-8 md:w-3/5 lg:w-2/3 flex flex-col justify-center relative z-10"
      >
        <p class="text-sm font-semibold mb-2 opacity-80">
          {{ holiday.date }}
          <span v-if="holiday.end_date && holiday.end_date !== holiday.date">
            — {{ holiday.end_date }}
          </span>
        </p>
        <h2
          class="text-3xl font-bold mb-4"
          :style="{ fontFamily: holiday.styles.title_font_family }"
        >
          {{ holiday.title }}
        </h2>
        <p class="leading-relaxed text-lg opacity-90">
          {{ holiday.description }}
        </p>
      </div>
    </div>
  </section>
</template>
