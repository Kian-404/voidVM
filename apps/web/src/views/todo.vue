<template>
  <ul>
    <li v-for="todo in todos" :key="todo.id">{{ todo.name }}</li>
  </ul>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { supabase } from '../utils/supabase'
const todos: any = ref([])

async function getTodos() {
  const { data } = await supabase.from('todos').select()
  todos.value = data
}

onMounted(() => {
  getTodos()
})

</script>