<script setup>
import Icon, { CoffeeAnimated } from '@ira-icons/iraicons/vue';
import Search from '@ira-icons/iraicons-vue/search-minimalist';
</script>

<template>
  <main>
    <Search :size="31" color="#663399" label="Individual import" />
    <CoffeeAnimated :size="29" label="Named import" :speed="2" />
    <Icon name="heart" :size="27" />
  </main>
</template>
